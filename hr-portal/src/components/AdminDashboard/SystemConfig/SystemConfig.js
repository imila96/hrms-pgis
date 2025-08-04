// src/components/AdminDashboard/SystemConfig/SystemConfig.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Button,
} from "@mui/material";

const SystemConfig = () => {
  const [settings, setSettings] = useState({
    siteTitle: "HR Portal",
    supportEmail: "support@example.com",
    emailNotifications: true,
    allowUserRegistration: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    alert("Configuration saved (frontend-only)");
    console.log(settings);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        System Configuration
      </Typography>

      <TextField
        label="Site Title"
        name="siteTitle"
        fullWidth
        margin="normal"
        value={settings.siteTitle}
        onChange={handleChange}
      />
      <TextField
        label="Support Email"
        name="supportEmail"
        fullWidth
        margin="normal"
        value={settings.supportEmail}
        onChange={handleChange}
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.emailNotifications}
            onChange={handleChange}
            name="emailNotifications"
          />
        }
        label="Enable Email Notifications"
      />
      <FormControlLabel
        control={
          <Switch
            checked={settings.allowUserRegistration}
            onChange={handleChange}
            name="allowUserRegistration"
          />
        }
        label="Allow User Registration"
      />

      <Box mt={2}>
        <Button variant="contained" onClick={handleSave}>
          Save Settings
        </Button>
      </Box>
    </Box>
  );
};

export default SystemConfig;
