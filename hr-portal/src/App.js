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
import EmployeeRecords from "./components/HrDashboard/EmployeeRecords";
import LeaveManagement from "./components/HrDashboard/LeaveManagement";
import AttendanceTracking from "./components/HrDashboard/AttendanceTracking";
import RecruitmentManagement from "./components/HrDashboard/RecruitmentManagement";
import PolicyManagement from "./components/HrDashboard/PolicyManagement";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Generic protected route
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" replace />;
};

// Role-specific route (admin)
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "admin" ? children : <Navigate to="/" replace />;
};

// Role-specific route (HR)
const HrRoute = ({ children }) => {
  const { user } = useAuth();
  return user && user.role === "hr" ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgetPassword />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* HR Dashboard Main */}
          <Route
            path="/hr/*"
            element={
              <HrRoute>
                <HrDashboard />
              </HrRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
