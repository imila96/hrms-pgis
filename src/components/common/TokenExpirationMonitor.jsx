import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Monitors token expiration and shows warning before logout
 * Automatically refreshes token when needed (handled by axios interceptor)
 */
const TokenExpirationMonitor = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      const tokenExpiresAt = localStorage.getItem("tokenExpiresAt");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!token || !refreshToken) {
        return;
      }

      if (tokenExpiresAt) {
        const expiresAt = parseInt(tokenExpiresAt, 10);
        const now = Date.now();
        const timeUntilExpiry = expiresAt - now;

        // If access token expired and no refresh token, logout
        if (timeUntilExpiry <= 0 && !refreshToken) {
          console.log("Token expired, logging out...");
          logout();
          navigate("/");
        }

        // Optional: Show warning 2 minutes before expiration
        if (timeUntilExpiry > 0 && timeUntilExpiry < 2 * 60 * 1000) {
          console.log("Token expiring soon, will refresh automatically");
        }
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkTokenExpiration, 30000);

    // Check immediately on mount
    checkTokenExpiration();

    return () => clearInterval(interval);
  }, [logout, navigate]);

  return null; // This component doesn't render anything
};

export default TokenExpirationMonitor;
