import React, { useState, useContext } from "react";
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
  Card,
  CardContent,
  CardActions,
  Icon,
} from "@mui/material";
import {
  BeachAccess as BeachAccessIcon,
  AccessTime as AccessTimeIcon,
  PersonAdd,
  EventAvailable,
  Campaign,
  AccessTime,
  Brightness4,
  Brightness7,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import EmployeeRecords from "./EmployeeRecords";
import LeaveManagement from "./LeaveManagement";
import AttendanceTracking from "./AttendanceTracking";
import RecruitmentManagement from "./RecruitmentManagement";
import PolicyManagement from "./PolicyManagement";
import AnnouncementManagement from "./AnnouncementManagement";
import Profile from "../Profile/Profile";
import CreateEditProfile from "../Profile/CreateEditProfile";
import ComplainManagement from "../HrDashboard/ComplaintManagement";

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
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/hr/profile");
  };

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const goToRoleHome = (r) => {
    const map = {
      admin: "/admin/profile",
      hr: "/hr/profile",
      director: "/director/profile",
      employee: "/employee/profile",
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
        {/* Header AppBar */}
        <AppBar
          position="fixed"
          elevation={3}
          sx={{
            backgroundColor: "#4B49AC",
            color: "#FFFFFF",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Left: Title clickable */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                "&:hover": { color: "#98BDFF", transform: "scale(1.05)" },
                transition: "all 0.3s ease",
              }}
              onClick={() => navigate("/hr")}
            >
              HR Dashboard
            </Typography>

            {/* Center: Tabs */}
            <Box sx={{ display: "flex", gap: 2 }}>
              {tabItems.map(({ label, path }) => (
                <Button
                  key={path}
                  component={NavLink}
                  to={path}
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#E6E9FF",
                    borderRadius: "8px",
                    px: 2,
                    "&.active": {
                      backgroundColor: "#F3797E",
                      color: "#fff",
                    },
                    "&:hover": {
                      backgroundColor: "#7DA0FA",
                      color: "#fff",
                      transform: "scale(1.05)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            {/* Right: Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Theme toggle */}
              <IconButton
                sx={{
                  color: "#E6E9FF",
                  "&:hover": { color: "#98BDFF", transform: "scale(1.1)" },
                  transition: "0.2s",
                }}
                onClick={colorMode.toggleColorMode}
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>

              {/* Notifications */}
              <IconButton
                sx={{
                  color: "#E6E9FF",
                  "&:hover": { color: "#F3797E", transform: "scale(1.1)" },
                  transition: "0.2s",
                }}
              >
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Avatar Menu */}
              <Tooltip title="Account settings">
                <IconButton
                  sx={{
                    "&:hover": { transform: "scale(1.1)" },
                    transition: "0.2s",
                  }}
                  onClick={handleMenuOpen}
                >
                  {user?.photoURL ? (
                    <Avatar src={user.photoURL} />
                  ) : (
                    <Avatar sx={{ bgcolor: "#98BDFF" }}>
                      {getInitials(user?.name || user?.email) || (
                        <AccountCircleIcon />
                      )}
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
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem disabled>
                  Active: {(user?.activeRole || "").toUpperCase()}
                </MenuItem>
                {user?.roles
                  ?.filter((r) => r !== user?.activeRole)
                  .map((r) => (
                    <MenuItem key={r} onClick={() => switchTo(r)}>
                      Switch to {r.charAt(0).toUpperCase() + r.slice(1)} view
                    </MenuItem>
                  ))}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 5, backgroundColor: "#f0f1f5ff" }}
        >
          <Routes>
            {/* Dashboard Home */}
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
                    Department: HR • Employee ID: {user?.employeeId || "EMP001"}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    High-Level Overview
                  </Typography>

                  {/* Overview Cards */}
                  <Grid container spacing={2} sx={{ my: 3 }}>
                    {[
                      {
                        title: "Total Staff",
                        value: "247",
                        subtitle: "Active employees across departments",
                      },
                      {
                        title: "Attendance Rate",
                        value: "94.2%",
                        subtitle: "Company-wide average for current month",
                      },
                      {
                        title: "Open Positions",
                        value: "18",
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

                  {/* Quick Access Cards */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    Quick Access
                  </Typography>
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
                                12 Days
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
                                96%
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
                        {[
                          {
                            text: "Office Renovation - Nov 12th, Floor 3 closed",
                          },
                          { text: "New Benefits Package - Starting Dec 1st" },
                          { text: "Company Town Hall - Nov 25th, 3:00 PM" },
                        ].map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <EventNoteIcon
                                color="secondary"
                                fontSize="small"
                              />
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                </Box>
              }
            />
            <Route path="profile" element={<Profile />} />
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
