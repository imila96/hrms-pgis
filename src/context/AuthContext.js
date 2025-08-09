// src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

const CFG_KEY = "system_config";
const CFG_DEFAULTS = { sessionTimeoutMinutes: 30 };

function loadConfig() {
  try {
    const raw = localStorage.getItem(CFG_KEY) || "{}";
    return { ...CFG_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return CFG_DEFAULTS;
  }
}

export const AuthProvider = ({ children }) => {
  // ---- HYDRATE from localStorage: token, email, roles[], activeRole ----
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const email = localStorage.getItem("email") || null;

    // read roles with legacy fallback
    let roles = [];
    try {
      roles = JSON.parse(localStorage.getItem("roles") || "[]");
    } catch {
      roles = [];
    }
    if (!roles.length) {
      const legacyRole = localStorage.getItem("role");
      if (legacyRole) roles = [legacyRole];
    }

    // upgrade: if admin/hr/director then also include "employee"
    if (
      roles.some((r) => ["admin", "hr", "director"].includes(r)) &&
      !roles.includes("employee")
    ) {
      roles = [...roles, "employee"];
      localStorage.setItem("roles", JSON.stringify(roles));
    }

    const activeRole = localStorage.getItem("activeRole") || roles[0] || null;

    return token ? { email, roles, activeRole } : null;
  });

  // ---- Switch active role (keeps same token) ----
  const setActiveRole = useCallback((role) => {
    setUser((prev) => {
      if (!prev?.roles?.includes(role)) return prev;
      localStorage.setItem("activeRole", role);
      // keep legacy "role" key in sync if anything else reads it
      localStorage.setItem("role", role);
      return { ...prev, activeRole: role };
    });
  }, []);

  const hasRole = useCallback(
    (role) => !!user?.roles?.includes(role),
    [user?.roles]
  );

  // ---- Logout ----
  const logout = useCallback(() => {
    setUser(null);
    ["token", "email", "role", "roles", "activeRole"].forEach((k) =>
      localStorage.removeItem(k)
    );
  }, []);

  // ---- Inactivity auto-logout ----
  useEffect(() => {
    if (!user) return;
    let cfg = loadConfig();
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      const mins = Math.max(1, Number(cfg.sessionTimeoutMinutes) || 30);
      timer = setTimeout(() => logout(), mins * 60 * 1000);
    };
    const onCfgChange = () => {
      cfg = loadConfig();
      resetTimer();
    };
    const onStorage = (e) => {
      if (e.key === CFG_KEY) onCfgChange();
    };

    const activityEvents = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));
    window.addEventListener("system-config-change", onCfgChange);
    window.addEventListener("storage", onStorage);

    resetTimer();
    return () => {
      clearTimeout(timer);
      activityEvents.forEach((ev) =>
        window.removeEventListener(ev, resetTimer)
      );
      window.removeEventListener("system-config-change", onCfgChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, setActiveRole, hasRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
