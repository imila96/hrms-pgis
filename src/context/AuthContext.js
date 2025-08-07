// src/context/AuthContext.js
import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 1. hydrate from localStorage (old logic)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    if (!token || !role || !email) return null;
    return { email, role };
  });

  // 2. new login logic (with hard-coded creds)
  const login = ({ email, password }) => {
    let role = null;

    if (email === "admin@workhub.com" && password === "Admin@123") {
      role = "system-admin";
    } else if (email === "hr@workhub.com" && password === "Hr@123") {
      role = "hr";
    } else if (email === "user@workhub.com" && password === "User@123") {
      role = "employee";
    }

    if (!role) {
      return null; // login failed
    }

    // persist exactly as old code did
    localStorage.setItem("token", "dummy-token");
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);

    // update state
    setUser({ email, role });
    return role;
  };

  // 3. logout clears both state and storage (old + new)
  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
