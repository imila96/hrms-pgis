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

// HR subpages
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

import DirectorDashboard from "./components/DirectorDashboard/DirectorDashboard";

import { AuthProvider, useAuth } from "./context/AuthContext";

/* ---------------- Guards ---------------- */

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem("token");
  return user || token ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const active = user?.activeRole || localStorage.getItem("activeRole");
  return active === "admin" ? children : <Navigate to="/" replace />;
};

const HrRoute = ({ children }) => {
  const { user } = useAuth();
  const active = user?.activeRole || localStorage.getItem("activeRole");
  return active === "hr" ? children : <Navigate to="/" replace />;
};

const EmployeeRoute = ({ children }) => {
  const { user } = useAuth();
  const active = user?.activeRole || localStorage.getItem("activeRole");
  return active === "employee" ? children : <Navigate to="/" replace />;
};

const DirectorRoute = ({ children }) => {
  const { user } = useAuth();
  const active = user?.activeRole || localStorage.getItem("activeRole");
  return active === "director" ? children : <Navigate to="/" replace />;
};

/* ---------------- App ---------------- */

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

          {/* HR */}
          <Route
            path="/hr/*"
            element={
              <HrRoute>
                <HrDashboard />
              </HrRoute>
            }
          >
            <Route path="records" element={<EmployeeRecords />} />
            <Route path="leave-management" element={<LeaveManagement />} />
            <Route path="attendance-tracking" element={<AttendanceTracking />} />
            <Route path="recruitment" element={<RecruitmentManagement />} />
            <Route path="policies" element={<PolicyManagement />} />
            <Route path="" element={<Navigate to="records" replace />} />
          </Route>

          {/* director */}
          <Route
            path="/director/*"
            element={
              <DirectorRoute>
                <DirectorDashboard />
              </DirectorRoute>
            }
          />

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
