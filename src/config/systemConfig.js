export const STORAGE_KEY = "system_config";

export const DEFAULT_CONFIG = {
  siteTitle: "HR Portal",
  timezone: "Asia/Colombo",
  workdayStart: "09:00",
  workdayEnd: "18:00",
  allowManualAttendance: true,
  sessionTimeoutMinutes: 30,
};

export const loadConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "{}";
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch { return DEFAULT_CONFIG; }
};

export const saveConfig = (cfg) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent("system-config-change", { detail: cfg }));
};

export const onConfigChange = (handler) => {
  const fn = () => handler(loadConfig());
  window.addEventListener("system-config-change", fn);
  // cross-tab sync:
  const storageFn = (e) => { if (e.key === STORAGE_KEY) handler(loadConfig()); };
  window.addEventListener("storage", storageFn);
  return () => { window.removeEventListener("system-config-change", fn); window.removeEventListener("storage", storageFn); };
};
