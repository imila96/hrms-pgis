// src/AppThemeProvider.js
import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

const CFG_KEY = "system_config";
const DEFAULTS = { themeMode: "light" };

function loadConfig() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(CFG_KEY) || "{}") };
  } catch {
    return DEFAULTS;
  }
}
function getEffectiveMode(cfg) {
  const mode = cfg.themeMode || "light";
  if (mode === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return mode;
}

export default function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => getEffectiveMode(loadConfig()));

  useEffect(() => {
    const apply = () => setMode(getEffectiveMode(loadConfig()));
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onMql = () => apply();

    const onCfg = () => apply();
    const onStorage = (e) => {
      if (e.key === CFG_KEY) apply();
    };

    window.addEventListener("system-config-change", onCfg);
    window.addEventListener("storage", onStorage);
    mql.addEventListener?.("change", onMql);

    return () => {
      window.removeEventListener("system-config-change", onCfg);
      window.removeEventListener("storage", onStorage);
      mql.removeEventListener?.("change", onMql);
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
      }),
    [mode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}