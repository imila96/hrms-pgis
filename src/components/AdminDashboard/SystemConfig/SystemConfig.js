// src/components/AdminDashboard/SystemConfig/SystemConfig.js
import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

/** --- Local, self-contained config helper (no external imports needed) --- */
const STORAGE_KEY = "system_config";
const DEFAULT_CONFIG = {
  siteTitle: "HR Portal",
  timezone: "Asia/Colombo",
  workdayStart: "09:00",
  workdayEnd: "18:00",
  allowManualAttendance: true,
  sessionTimeoutMinutes: 30,
  themeMode: "light", // NEW: 'light' | 'dark' | 'system'
};

const loadConfig = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "{}";
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CONFIG;
  }
};

const saveConfig = (cfg) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  // broadcast so other components can react (Attendance, AuthContext, Theme)
  window.dispatchEvent(new CustomEvent("system-config-change", { detail: cfg }));
};
/** ----------------------------------------------------------------------- */

export default function SystemConfig() {
  const [cfg, setCfg] = useState(loadConfig());
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const fileRef = useRef(null);

  // Reflect site title immediately while editing this page
  useEffect(() => {
    document.title = `${cfg.siteTitle} • Admin Settings`;
  }, [cfg.siteTitle]);

  const set = (k, v) => setCfg((c) => ({ ...c, [k]: v }));

  const handleSave = () => {
    saveConfig(cfg);
    setSnack({ open: true, msg: "Saved", sev: "success" });
  };

  const handleReset = () => setCfg(DEFAULT_CONFIG);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(cfg, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "system-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const parsed = JSON.parse(r.result);
        setCfg({ ...DEFAULT_CONFIG, ...parsed });
        setSnack({ open: true, msg: "Imported", sev: "success" });
      } catch {
        setSnack({ open: true, msg: "Invalid file", sev: "error" });
      }
    };
    r.readAsText(file);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        System Configuration
      </Typography>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Site Title"
              fullWidth
              value={cfg.siteTitle}
              onChange={(e) => set("siteTitle", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Timezone"
              fullWidth
              value={cfg.timezone}
              onChange={(e) => set("timezone", e.target.value)}
              helperText="e.g., Asia/Colombo or UTC"
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="Workday Start"
              type="time"
              fullWidth
              value={cfg.workdayStart}
              onChange={(e) => set("workdayStart", e.target.value)}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              label="Workday End"
              type="time"
              fullWidth
              value={cfg.workdayEnd}
              onChange={(e) => set("workdayEnd", e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Session Timeout (min)"
              type="number"
              fullWidth
              value={cfg.sessionTimeoutMinutes}
              onChange={(e) =>
                set("sessionTimeoutMinutes", Math.max(1, +e.target.value || 1))
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControlLabel
              control={
                <Switch
                  checked={cfg.allowManualAttendance}
                  onChange={(e) =>
                    set("allowManualAttendance", e.target.checked)
                  }
                />
              }
              label="Allow Manual Attendance"
            />
          </Grid>

          {/* NEW: Theme Mode */}
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="theme-mode-lbl">Theme Mode</InputLabel>
              <Select
                labelId="theme-mode-lbl"
                label="Theme Mode"
                value={cfg.themeMode}
                onChange={(e) => set("themeMode", e.target.value)}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System (follow OS)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="outlined" onClick={handleExport}>
          Export
        </Button>
        <Button variant="text" onClick={() => fileRef.current?.click()}>
          Import
        </Button>
        <input
          hidden
          ref={fileRef}
          type="file"
          accept="application/json"
          onChange={handleImport}
        />
      </Stack>

      <Snackbar
        open={snack.open}
        autoHideDuration={2000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.sev}
          variant="filled"
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
