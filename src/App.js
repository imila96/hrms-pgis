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
import Logout from "./components/Logout/Logout";

import AdminDashboard from "./components/AdminDashboard/AdminDashboard";
import HrDashboard from "./components/HrDashboard/HrDashboard";

// HR subpages
import EmployeeRecords from "./components/HrDashboard/EmployeeRecords";
import LeaveManagement from "./components/HrDashboard/LeaveManagement";
import AttendanceTracking from "./components/HrDashboard/AttendanceTracking";
import RecruitmentManagement from "./components/HrDashboard/RecruitmentManagement";
import PolicyManagement from "./components/HrDashboard/PolicyManagement";

import EmployeeDashboardLayout from "./components/EmployeeDashboard/DashboardLayout";
import EmployeeOverview from "./components/EmployeeDashboard/EmployeeOverview";
import Profile from "./components/Profile/Profile";
import CreateEditProfile from "./components/Profile/CreateEditProfile";
import Salary from "./components/EmployeeDashboard/Salary";
import Attendance from "./components/EmployeeDashboard/Attendance";
import Leave from "./components/EmployeeDashboard/Leave";
import Policies from "./components/EmployeeDashboard/Policies";
import Announcements from "./components/EmployeeDashboard/Announcements";
import Complaints from "./components/EmployeeDashboard/Complaints";
import Issues from "./components/EmployeeDashboard/Issues";
import Reports from "./components/EmployeeDashboard/Reports";

import DirectorDashboard from "./components/DirectorDashboard/DirectorDashboard";

import { AuthProvider, useAuth } from "./context/AuthContext";
import TokenExpirationMonitor from "./components/common/TokenExpirationMonitor";
import RoleTransitionOverlay from "./components/common/RoleTransitionOverlay";

/* ---------------- Guards ---------------- */

const roleHomePath = (role) => {
  const map = {
    admin: "/admin/profile",
    hr: "/hr/profile",
    employee: "/employee",
    director: "/director/profile",
  };
  return map[role] || "/";
};

const makeRoleRoute = (expectedRole) => {
  return ({ children }) => {
    const { user } = useAuth();
    const token = localStorage.getItem("token");
    const active = user?.activeRole || localStorage.getItem("activeRole");

    if (!token && !user) {
      return <Navigate to="/" replace />;
    }

    if (active === expectedRole) {
      return children;
    }

    if (active) {
      return <Navigate to={roleHomePath(active)} replace />;
    }

    return <Navigate to="/" replace />;
  };
};

const AdminRoute = makeRoleRoute("admin");
const HrRoute = makeRoleRoute("hr");
const EmployeeRoute = makeRoleRoute("employee");
const DirectorRoute = makeRoleRoute("director");

/* ---------------- App ---------------- */

const AppRoutes = () => {
  const { roleTransition } = useAuth();

  return (
    <>
      <TokenExpirationMonitor />
      <RoleTransitionOverlay
        open={!!roleTransition}
        message={roleTransition?.message}
        role={roleTransition?.role}
      />
      <Routes>
        {/* public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/logout" element={<Logout />} />

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
          <Route index element={<EmployeeOverview />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/edit" element={<CreateEditProfile />} />
          <Route path="profile/edit/:id" element={<CreateEditProfile />} />
          <Route path="salary" element={<Salary />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leave />} />
          <Route path="policies" element={<Policies />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="issues" element={<Issues />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
