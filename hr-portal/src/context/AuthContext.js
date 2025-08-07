// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";
// optional: decode the JWT instead of saving the role by hand
// import jwtDecode from "jwt-decode";

// Create Auth Context
const AuthContext = createContext(null);

// Provider component to wrap the app
export const AuthProvider = ({ children }) => {
  // Pull user info from storage once on first render
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role  = localStorage.getItem("role");
    if (!token || !role) return null;
    return { role };

    /* Option B – safer: read role out of the JWT itself
    try {
      const { roles } = jwtDecode(token);        // e.g. [{ authority: "ROLE_ADMIN" }, ...]
      const role = roles[0].toLowerCase().replace("role_", "");
      return { role };
    } catch {
      return null;  // bad/expired token → logout
    }
    */
  });

  // Simulate login function (replace with real API call)
  const login = ({ email, password }) => {
    if (email === "admin@workhub.com" && password === "Admin@123") {
      const role = "system-admin";
      setUser({ role });
      localStorage.setItem("role", role);
      return role;
    }
    if (email === "hr@workhub.com" && password === "Hr@123") {
      const role = "hr";
      setUser({ role });
      localStorage.setItem("role", role);
      return role;
    }
    return null; // login failed
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy usage
export const useAuth = () => useContext(AuthContext);
