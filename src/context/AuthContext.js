// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";

// Create Auth Context
const AuthContext = createContext(null);

// Provider component to wrap the app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Store user info or null

  // Simulate login function
  const login = ({ email, password }) => {
    // Replace with real API call & validation
    if (email === "admin@workhub.com" && password === "Admin@123") {
      setUser({ email, role: "system-admin" });
      return "system-admin"; // return role
    }
    if (email === "hr@workhub.com" && password === "Hr@123") {
      setUser({ email, role: "hr" });
      return "hr"; // return role
    }
    if (email === "user@workhub.com" && password === "User@123") {
    setUser({ email, role: "employee" });
    return "employee";
  }

    return null; // login failed
  };

  // Logout function
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy usage
export const useAuth = () => useContext(AuthContext);
