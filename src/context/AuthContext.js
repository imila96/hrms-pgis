// src/context/AuthContext.js
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";

const AuthContext = createContext(null);

/** ---- Read session timeout from System Config (localStorage) ----------- */
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
/** ---------------------------------------------------------------------- */

export const AuthProvider = ({ children }) => {
  // 1) Hydrate from localStorage (unchanged)
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    if (!token || !role || !email) return null;
    return { email, role };
  });

  // 2) Login (unchanged - hardcoded roles)
  const login = ({ email, password }) => {
    let role = null;

    if (email === "admin@workhub.com" && password === "Admin@123") {
      role = "system-admin";
    } else if (email === "hr@workhub.com" && password === "Hr@123") {
      role = "hr";
    } else if (email === "user@workhub.com" && password === "User@123") {
      role = "employee";
    }

    if (!role) return null; // login failed

    localStorage.setItem("token", "dummy-token");
    localStorage.setItem("role", role);
    localStorage.setItem("email", email);

    setUser({ email, role });
    return role;
  };

  // 3) Logout (unchanged), wrapped in useCallback so effects can depend on it safely
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
  }, []);

  // 4) Auto-logout after inactivity, driven by SystemConfig.sessionTimeoutMinutes
  useEffect(() => {
    if (!user) return; // only track when logged in

    let cfg = loadConfig();
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      // protect against bad/empty values
      const mins = Math.max(1, Number(cfg.sessionTimeoutMinutes) || 30);
      timer = setTimeout(() => {
        logout();
      }, mins * 60 * 1000);
    };

    // Update config when SystemConfig page saves (custom event) or another tab changes it
    const onCfgChange = () => {
      cfg = loadConfig();
      resetTimer();
    };
    const onStorage = (e) => {
      if (e.key === CFG_KEY) onCfgChange();
    };

    // User activity resets the timer
    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));
    window.addEventListener("system-config-change", onCfgChange);
    window.addEventListener("storage", onStorage);

    // start timer immediately
    resetTimer();

    return () => {
      clearTimeout(timer);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
      window.removeEventListener("system-config-change", onCfgChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [user, logout]);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
