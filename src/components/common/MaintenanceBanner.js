// src/components/common/MaintenanceBanner.js
import React, { useEffect, useState } from "react";
import { Alert, Collapse } from "@mui/material";

const KEY = "system_config";
const readCfg = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); }
  catch { return {}; }
};

export default function MaintenanceBanner() {
  const [cfg, setCfg] = useState(readCfg());

  useEffect(() => {
    const onCfg = () => setCfg(readCfg());
    const onStorage = (e) => { if (e.key === KEY) onCfg(); };
    window.addEventListener("system-config-change", onCfg);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("system-config-change", onCfg);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const show = !!cfg.maintenanceEnabled;
  const msg = cfg.maintenanceMessage || "The system is under maintenance.";

  return (
    <Collapse in={show} unmountOnExit>
      <Alert severity="warning" variant="filled" sx={{ borderRadius: 0 }}>
        {msg}
      </Alert>
    </Collapse>
  );
}
