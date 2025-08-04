// src/components/HrDashboard/HrDashboard.js
import React from "react";


import { Box, Typography, Tabs, Tab, Button } from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";

import EmployeeRecords from "./EmployeeRecords";
import LeaveManagement from "./LeaveManagement";
import AttendanceTracking from "./AttendanceTracking";
import RecruitmentManagement from "./RecruitmentManagement";
import PolicyManagement from "./PolicyManagement";


const HrDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const tabPaths = [
    "/hr/employee-records",
    "/hr/leave-management",
    "/hr/attendance-tracking",
    "/hr/recruitment-management",
    "/hr/policy-management"
  ];

  const tabIndex = tabPaths.findIndex((path) =>
    location.pathname.startsWith(path)
  );

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
        HR Dashboard
      </Typography>

      <Tabs
        value={tabIndex !== -1 ? tabIndex : 0}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 2 }}
      >
        <Tab label="Employee Records" />
        <Tab label="Leave Management" />
        <Tab label="Attendance Tracking" />
        <Tab label="Recruitment" />
        <Tab label="Policy Management" />
      </Tabs>

      {/* Route Sub-Sections */}
      <Routes>
        <Route path="employee-records" element={<EmployeeRecords />} />
        <Route path="leave-management" element={<LeaveManagement />} />
        <Route path="attendance-tracking" element={<AttendanceTracking />} />
        <Route path="recruitment-management" element={<RecruitmentManagement />} />
        <Route path="policy-management" element={<PolicyManagement />} />
      </Routes>

      <Button
        variant="contained"
        color="secondary"
        sx={{ mt: 4 }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  );
};

export default HrDashboard;
