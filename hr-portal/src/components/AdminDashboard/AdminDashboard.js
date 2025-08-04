// src/components/AdminDashboard/AdminDashboard.js
import React from "react";


import { Box, Typography, Button, Tabs, Tab } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Routes, Route, useLocation, useMatch } from "react-router-dom";
import UserManagement from "./UserManagement/UserManagement";
import SystemConfig from "./SystemConfig/SystemConfig";
import Troubleshooting from "./Troubleshooting/Troubleshooting";
import SystemLogs from "./SystemLogs/SystemLogs";
import Notifications from "./Notifications/Notifications";
import Analytics from "./Analytics/Analytics";





const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = ["/admin/users", "/admin/system", "/admin/troubleshoot", "/admin/logs", "/admin/notifications","/admin/analytics"];
  const tabIndex = tabPaths.findIndex((path) => location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleTabChange = (e, newValue) => {
    navigate(tabPaths[newValue]);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" mb={2}>
        Admin Dashboard
      </Typography>

      <Tabs value={tabIndex !== -1 ? tabIndex : 0} onChange={handleTabChange} textColor="primary" indicatorColor="primary" sx={{ mb: 2 }}>
        <Tab label="User Management" />
        <Tab label="System Configuration" />
        <Tab label="Troubleshooting" />
        <Tab label="Logs & Backup" />
        <Tab label="Notifications" />
        <Tab label="Analytics" />


      </Tabs>

      {/* Route to Sub-Sections */}
      <Routes>
        <Route path="users" element={<UserManagement />} />
        <Route path="system" element={<SystemConfig />} />
        <Route path="troubleshoot" element={<Troubleshooting />} />
        <Route path="logs" element={<SystemLogs />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="analytics" element={<Analytics />} />

      </Routes>

      <Button variant="contained" color="secondary" sx={{ mt: 4 }} onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
};

export default AdminDashboard;
