import React, { useState, useContext, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Divider,
} from "@mui/material";
import {
  BeachAccess as BeachAccessIcon,
  AccessTime as AccessTimeIcon,
  PersonAdd,
  EventAvailable,
  Campaign,
  AccessTime,
  Brightness4,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import EmployeeRecords from "./EmployeeRecords";
import LeaveManagement from "./LeaveManagement";
import AttendanceTracking from "./AttendanceTracking";
import RecruitmentManagement from "./RecruitmentManagement";
import PolicyManagement from "./PolicyManagement";
import AnnouncementManagement from "./AnnouncementManagement";
import CreateEditProfile from "../Profile/CreateEditProfile";
import ComplainManagement from "../HrDashboard/ComplaintManagement";
import axiosInstance from "../../AxiosInstance";

const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const tabItems = [
  { label: "Employee Records", path: "/hr/records" },
  { label: "Leave", path: "/hr/leave" },
  { label: "Attendance", path: "/hr/attendance" },
  { label: "Recruitment", path: "/hr/recruitment" },
  { label: "Policies", path: "/hr/policies" },
  { label: "Announcements", path: "/hr/announcements" },
  { label: "Complaints", path: "/hr/complaints" },
];

// quick action card details
const quickActions = [
  {
    title: "Add New Employee",
    description: "Quickly onboard a new staff member by adding their details.",
    buttonText: "Create Employee",
    icon: <PersonAdd />,
    color: "#1976d2",
    colorVariant: "primary",
    path: "/hr/records/newEmployee",
  },
  {
    title: "Approve Pending Leaves",
    description: "Review and approve or reject employee leave requests.",
    buttonText: "Review Requests",
    icon: <EventAvailable />,
    color: "#2e7d32",
    colorVariant: "success",
    path: "/hr/leave",
  },
  {
    title: "Post Announcement",
    description: "Share announcements and updates with all employees.",
    buttonText: "Create Announcement",
    icon: <Campaign />,
    color: "#ed6c02",
    colorVariant: "warning",
    path: "/hr/announcements",
  },
  {
    title: "View Attendance Summary",
    description: "Check attendance overview for the current month.",
    buttonText: "Open Attendance",
    icon: <AccessTime />,
    color: "#9c27b0",
    colorVariant: "secondary",
    path: "/hr/attendance",
  },
];

const HrDashboard = () => {
  const {
    logout,
    user,
    setActiveRole,
    beginRoleTransition,
    endRoleTransition,
  } = useAuth();
  const navigate = useNavigate();
  const colorMode = useContext(ColorModeContext);

  // State for the account menu anchor element.
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/");
  };

  // Produce initials for the avatar
  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };
  // Map roles to their home routes
  const goToRoleHome = (r) => {
    const map = {
      admin: "/admin",
      hr: "/hr",
      director: "/director",
      employee: "/employee",
    };
    return map[r] || "/";
  };

  const switchTo = (role) => {
    beginRoleTransition(role);
    setActiveRole(role);
    handleMenuClose();
    setTimeout(() => {
      navigate(goToRoleHome(role));
      setTimeout(() => endRoleTransition(), 600);
    }, 0);
  };

  const customTheme = createTheme({
    palette: {
      primary: {
        main: "#4B49AC",
      },
      secondary: {
        main: "#98BDFF",
      },
      info: {
        main: "#7DA0FA",
      },
      success: {
        main: "#7978E9",
      },
      error: {
        main: "#F3797E",
      },
      background: {
        default: "#acaeb8ff",
      },
    },
    typography: {
      fontFamily: "'Poppins', sans-serif",
    },
  });

  // Dashboard summary state fetched from backend
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  const [dashboardError] = useState(null);

  // Fetch dashboard summary on mount
  useEffect(() => {
    let mounted = true;
    setLoadingDashboard(true);
    axiosInstance.get("/dashboard/hr-home").then((res) => {
      if (mounted) {
        setDashboard(res.data);
        setLoadingDashboard(false);
      }
    });
    return () => (mounted = false);
  }, []);

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#f0f1f5ff",
        }}
      >
        {/*
          Header AppBar
        */}
        <AppBar
          position="sticky"
          elevation={3}
          sx={{
            background: "linear-gradient(135deg, #4B49AC 0%, #7DA0FA 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(75,73,172,0.25)",
          }}
        >
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
          >
            {/* Hr Dashboard Title */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                letterSpacing: 0.5,
                fontSize: { xs: "1rem", sm: "1.25rem" },
                "&:hover": { color: "#98BDFF", transform: "scale(1.05)" },
                transition: "all 0.3s ease",
              }}
              onClick={() => navigate("/hr")}
            >
              HR Dashboard
            </Typography>

            {/* Tabs - primary navigation across HR modules */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {tabItems.map(({ label, path }) => (
                <Button
                  key={path}
                  component={NavLink}
                  to={path}
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    color: "#E6E9FF",
                    borderRadius: "8px",
                    px: 1.5,
                    py: 0.8,
                    minWidth: "auto",
                    "&.active": {
                      backgroundColor: "#F3797E",
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(243,121,126,0.4)",
                    },
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.15)",
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            {/* Actions (theme toggle, notifications, avatar menu) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <IconButton
                sx={{
                  color: "#E6E9FF",
                  "&:hover": {
                    color: "#98BDFF",
                    transform: "scale(1.1)",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                  transition: "0.2s",
                }}
                onClick={colorMode.toggleColorMode}
                aria-label="Toggle theme"
              >
                <Brightness4 />
              </IconButton>

              <IconButton
                sx={{
                  color: "#E6E9FF",
                  "&:hover": {
                    color: "#F3797E",
                    transform: "scale(1.1)",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                  transition: "0.2s",
                }}
                aria-label="Notifications"
              >
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Avatar Menu - shows active role and allows switching roles or logout */}
              <Tooltip title="Account settings">
                <IconButton
                  sx={{
                    "&:hover": {
                      transform: "scale(1.1)",
                      bgcolor: "rgba(255,255,255,0.1)",
                    },
                    transition: "0.2s",
                  }}
                  onClick={handleMenuOpen}
                  aria-label="Account menu"
                >
                  {user?.photoURL ? (
                    <Avatar
                      src={user.photoURL}
                      sx={{
                        width: 36,
                        height: 36,
                        border: "2px solid #98BDFF",
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        bgcolor: "#98BDFF",
                        width: 36,
                        height: 36,
                        fontWeight: 700,
                        border: "2px solid #E6E9FF",
                      }}
                    >
                      {getInitials(user?.name || user?.email)}
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                PaperProps={{
                  sx: {
                    mt: 1,
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  },
                }}
              >
                <MenuItem disabled sx={{ opacity: 0.6, fontWeight: 600 }}>
                  Active: {(user?.activeRole || "").toUpperCase()}
                </MenuItem>
                {user?.roles
                  ?.filter((r) => r !== user?.activeRole)
                  .map((r) => (
                    <MenuItem key={r} onClick={() => switchTo(r)}>
                      Switch to {r.charAt(0).toUpperCase() + r.slice(1)} view
                    </MenuItem>
                  ))}
                <MenuItem onClick={handleLogout} sx={{ color: "#F3797E" }}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, backgroundColor: "#f0f1f5ff" }}
        >
          <Routes>
            {/* Dashboard Home*/}
            <Route
              index
              element={
                <Box sx={{ py: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    Welcome back, {user?.name || "HR User"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Department: {dashboard?.department || "HR"} • Employee ID:{" "}
                    {dashboard?.employeeId ?? user?.employeeId ?? "-"}
                  </Typography>
                  {loadingDashboard && (
                    <Typography variant="caption" color="text.secondary">
                      Loading dashboard...
                    </Typography>
                  )}
                  {dashboardError && (
                    <Typography variant="caption" color="error">
                      Failed to load dashboard.
                    </Typography>
                  )}
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    High-Level Overview
                  </Typography>

                  {/* Overview Cards - total staff, attendance rate, open positions */}
                  <Grid container spacing={2} sx={{ my: 3 }}>
                    {[
                      {
                        title: "Total Staff",
                        value: dashboard?.totalStaff ?? "-",
                        subtitle: "Active employees across departments",
                      },
                      {
                        title: "Attendance Rate",
                        value:
                          dashboard?.orgAttendanceRate != null
                            ? `${(dashboard.orgAttendanceRate * 100).toFixed(
                                1
                              )}%`
                            : "-",
                        subtitle: "Attendance rate of PGIS employees(Today)",
                      },
                      {
                        title: "Open Positions",
                        value: dashboard?.openPositions ?? "-",
                        subtitle: "Current vacancies across departments",
                      },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={4} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            transition: "0.3s",
                            "&:hover": {
                              boxShadow: "0px 4px 12px rgba(73, 105, 200, 0.2)",
                              transform: "translateY(-3px)",
                            },
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {item.title}
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="#4B49AC"
                          >
                            {item.value}
                          </Typography>
                          <Typography variant="body2">
                            {item.subtitle}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                  {/* Quick action cards */}
                  <Grid container spacing={3}>
                    {quickActions.map((item) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        key={item.title}
                        sx={{
                          width: "22%",
                          display: "flex",
                        }}
                      >
                        <Paper
                          sx={{
                            p: 3,
                            borderRadius: 3,
                            textAlign: "center",
                            transition: "0.3s",
                            width: "100%",
                            minHeight: 240,
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            alignItems: "center",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                              transform: "scale(1.03)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              flexGrow: 1,
                            }}
                          >
                            {item.icon}
                            <Typography
                              variant="h6"
                              fontWeight={600}
                              sx={{ mt: 1 }}
                            >
                              {item.title}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 1, px: 1 }}
                            >
                              {item.description}
                            </Typography>
                          </Box>

                          <Button
                            size="small"
                            sx={{
                              mt: 2,
                              backgroundColor: "#7DA0FA",
                              color: "#fff",
                              fontWeight: 500,
                              px: 3,
                              borderRadius: 2,
                              textTransform: "none",
                              transition: "0.3s",
                              "&:hover": {
                                backgroundColor: "#4B49AC",
                                transform: "scale(1.05)",
                              },
                            }}
                            variant="contained"
                            onClick={() => navigate(item.path)}
                          >
                            {item.buttonText}
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Your Stats - cards */}
                  <Grid container spacing={3}>
                    {/* Stats */}
                    <Grid item xs={12} md={6} mt={2}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                        color="#4B49AC"
                      >
                        Your Stats
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              width: "100%",
                              minHeight: 120,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                              transition: "0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                transform: "scale(1.03)",
                              },
                            }}
                          >
                            {/* Icon */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#E8EAF6",
                                borderRadius: "50%",
                                width: 56,
                                height: 56,
                              }}
                            >
                              <BeachAccessIcon
                                sx={{ fontSize: 30, color: "#4B49AC" }}
                              />
                            </Box>

                            {/* Text */}
                            <Box sx={{ ml: 2, flexGrow: 1 }}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Leave Balance
                              </Typography>
                              <Typography variant="h5" fontWeight={600}>
                                {dashboard?.leaveBalances?.find(
                                  (b) => b.type === "ANNUAL"
                                )?.remaining ?? "-"}{" "}
                                Days
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Annual leave remaining
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              width: "100%",
                              minHeight: 120,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                              transition: "0.3s",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                transform: "scale(1.03)",
                              },
                            }}
                          >
                            {/* Icon */}
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "#E8F5E9",
                                borderRadius: "50%",
                                width: 56,
                                height: 56,
                              }}
                            >
                              <AccessTimeIcon
                                sx={{ fontSize: 30, color: "#388E3C" }}
                              />
                            </Box>

                            {/* Text */}
                            <Box sx={{ ml: 2, flexGrow: 1 }}>
                              <Typography
                                variant="subtitle2"
                                color="text.secondary"
                              >
                                Attendance Rate
                              </Typography>
                              <Typography variant="h5" fontWeight={600}>
                                {dashboard?.userAttendanceRate != null
                                  ? `${(
                                      dashboard.userAttendanceRate * 100
                                    ).toFixed(0)}%`
                                  : "-"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                This month’s attendance
                              </Typography>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Announcements */}
                  <Box sx={{ mt: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      color="#4B49AC"
                    >
                      Latest Announcements
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 3 }}>
                      <List>
                        {(dashboard?.announcements ?? []).map((a, idx) => (
                          <ListItem key={a.id ?? idx} button>
                            <ListItemIcon>
                              <EventNoteIcon
                                color="secondary"
                                fontSize="small"
                              />
                            </ListItemIcon>
                            <ListItemText
                              primary={a.title ?? a.summary ?? "Untitled"}
                              secondary={
                                a.publishedAt
                                  ? new Date(a.publishedAt).toLocaleString()
                                  : null
                              }
                            />
                          </ListItem>
                        ))}
                        {(dashboard?.announcements ?? []).length === 0 &&
                          [
                            "Office Renovation - Nov 12th, Floor 3 closed",
                            "New Benefits Package - Starting Dec 1st",
                            "Company Town Hall - Nov 25th, 3:00 PM",
                          ].map((text, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <EventNoteIcon
                                  color="secondary"
                                  fontSize="small"
                                />
                              </ListItemIcon>
                              <ListItemText primary={text} />
                            </ListItem>
                          ))}
                      </List>
                    </Paper>
                  </Box>
                </Box>
              }
            />
            <Route path="records" element={<EmployeeRecords />} />
            <Route path="records/newEmployee" element={<CreateEditProfile />} />
            <Route path="records/edit/:id" element={<CreateEditProfile />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="attendance" element={<AttendanceTracking />} />
            <Route path="recruitment" element={<RecruitmentManagement />} />
            <Route path="policies" element={<PolicyManagement />} />
            <Route path="announcements" element={<AnnouncementManagement />} />
            <Route path="complaints" element={<ComplainManagement />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HrDashboard;
