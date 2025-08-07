// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";

import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import HrDashboard from "./components/HrDashboard/HrDashboard";

// keep your existing HR‐subpages imports
import EmployeeRecords from "./components/HrDashboard/EmployeeRecords";
import LeaveManagement from "./components/HrDashboard/LeaveManagement";
import AttendanceTracking from "./components/HrDashboard/AttendanceTracking";
import RecruitmentManagement from "./components/HrDashboard/RecruitmentManagement";
import PolicyManagement from "./components/HrDashboard/PolicyManagement";

import EmployeeDashboardLayout from "./components/EmployeeDashboard/DashboardLayout";
import Profile from "./components/EmployeeDashboard/Profile";
import Salary from "./components/EmployeeDashboard/Salary";
import Attendance from "./components/EmployeeDashboard/Attendance";
import Leave from "./components/EmployeeDashboard/Leave";
import Policies from "./components/EmployeeDashboard/Policies";
import Complaints from "./components/EmployeeDashboard/Complaints";
import Reports from "./components/EmployeeDashboard/Reports";

import { AuthProvider, useAuth } from "./context/AuthContext";

// 1. generic guard
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

// 2. admin only
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  // adjust role name if needed ("admin" vs "system-admin")
  return user && user.role === "admin" ? children : <Navigate to="/" replace />;
};

// 3. HR only
const HrRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "hr" ? children : <Navigate to="/" replace />;
};

// 4. Employee only
const EmployeeRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "employee" ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* public */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />

          {/* admin */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* HR (preserves your old integrations) */}
          <Route
            path="/hr/*"
            element={
              <HrRoute>
                <HrDashboard />
              </HrRoute>
            }
          >
            {/* if HrDashboard doesn’t handle its own subroutes, you can add them here: */}
            <Route path="records" element={<EmployeeRecords />} />
            <Route path="leave-management" element={<LeaveManagement />} />
            <Route path="attendance-tracking" element={<AttendanceTracking />} />
            <Route path="recruitment" element={<RecruitmentManagement />} />
            <Route path="policies" element={<PolicyManagement />} />
            {/* redirect /hr → /hr/records */}
            <Route path="" element={<Navigate to="records" replace />} />
          </Route>

          {/* employee */}
          <Route
            path="/employee/*"
            element={
              <EmployeeRoute>
                <EmployeeDashboardLayout />
              </EmployeeRoute>
            }
          >
            <Route path="profile" element={<Profile />} />
            <Route path="salary" element={<Salary />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="policies" element={<Policies />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="reports" element={<Reports />} />
            <Route path="" element={<Navigate to="profile" replace />} />
          </Route>

          {/* catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
