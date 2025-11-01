import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor to automatically attach the token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration and auto-refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token, logout
        handleLogout();
        return Promise.reject(error);
      }

      try {
        // Call refresh token endpoint
        const { data } = await axios.post(
          "http://localhost:8080/auth/refresh",
          { refreshToken }
        );

        // Update access token
        localStorage.setItem("token", data.accessToken);
        
        // Update roles if they changed
        if (data.roles) {
          localStorage.setItem("roles", JSON.stringify(data.roles));
        }

        // Set token expiration for tracking
        const expiresAt = Date.now() + data.expiresIn;
        localStorage.setItem("tokenExpiresAt", expiresAt);

        // Update axios default header
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;

        // Process queued requests
        processQueue(null, data.accessToken);

        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError, null);
        handleLogout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

const handleLogout = () => {
  // Clear all auth data
  [
    "token",
    "refreshToken",
    "email",
    "role",
    "roles",
    "activeRole",
    "tokenExpiresAt",
    "rememberMe",
  ].forEach((key) => localStorage.removeItem(key));

  // Redirect to login
  window.location.href = "/";
};

export default axiosInstance;
