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

import EmployeeDashboardLayout from "./components/EmployeeDashboard/DashboardLayout";
import Profile from "./components/EmployeeDashboard/Profile";
import Salary from "./components/EmployeeDashboard/Salary";
import Attendance from "./components/EmployeeDashboard/Attendance";
import Leave from "./components/EmployeeDashboard/Leave";
import Policies from "./components/EmployeeDashboard/Policies";
import Complaints from "./components/EmployeeDashboard/Complaints";
import Reports from "./components/EmployeeDashboard/Reports";

import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected and role-based routes
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "system-admin" ? children : <Navigate to="/" replace />;
};

const HrRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "hr" ? children : <Navigate to="/" replace />;
};

const EmployeeRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "employee" ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* HR routes */}
          <Route
            path="/hr/*"
            element={
              <HrRoute>
                <HrDashboard />
              </HrRoute>
            }
          />

          {/* Employee routes */}
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
            {/* Redirect /employee to /employee/profile */}
            <Route path="" element={<Navigate to="profile" replace />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;