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
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Admin Subpages
import Profile from "../Profile/Profile";
import UserManagement from "./UserManagement/UserManagement";
import SystemConfig from "./SystemConfig/SystemConfig";
import Troubleshooting from "./Troubleshooting/Troubleshooting";
import SystemLogs from "./SystemLogs/SystemLogs";
import Notifications from "./Notifications/Notifications";
import Analytics from "./Analytics/Analytics";

// Theme Context
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const tabItems = [
  { label: "User Control", path: "/admin/users" },
  { label: "System Configuration", path: "/admin/system" },
  { label: "Troubleshooting", path: "/admin/troubleshoot" },
  { label: "Logs & Backup", path: "/admin/logs" },
  { label: "Notifications", path: "/admin/notifications" },
  { label: "Analytics", path: "/admin/analytics" },
];

const AdminDashboard = () => {
  const { logout, user } = useAuth();
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
    navigate("/admin/profile");
  };

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // Custom theme identical to DirectorDashboard
  const customTheme = createTheme({
    palette: {
      primary: { main: "#4B49AC" },
      secondary: { main: "#98BDFF" },
      info: { main: "#7DA0FA" },
      success: { main: "#7978E9" },
      error: { main: "#F3797E" },
      background: { default: "#acaeb8ff" },
    },
    typography: { fontFamily: "'Poppins', sans-serif" },
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
        {/* AppBar */}
        <AppBar
          position="fixed"
          elevation={3}
          sx={{ backgroundColor: "#4B49AC", color: "#fff" }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Title */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                "&:hover": { color: "#98BDFF", transform: "scale(1.05)" },
                transition: "all 0.3s ease",
              }}
              onClick={() => navigate("/admin")}
            >
              Admin Dashboard
            </Typography>

            {/* Tabs */}
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

            {/* Right actions */}
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
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Avatar */}
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
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 10 }}>
          <Routes>
            {/* Default Dashboard Overview */}
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
                    Welcome back, {user?.name || "Administrator"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Role: Administrator • System Control Center
                  </Typography>

                  {/* Overview Cards */}
                  <Grid container spacing={2} sx={{ my: 3 }}>
                    {[
                      {
                        title: "Active Users",
                        value: "312",
                        subtitle: "Currently managed accounts",
                      },
                      {
                        title: "System Logs",
                        value: "1289",
                        subtitle: "Latest activity records",
                      },
                      {
                        title: "Pending Issues",
                        value: "8",
                        subtitle: "Requires troubleshooting",
                      },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={4} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(73,105,200,0.2)",
                              transform: "translateY(-3px)",
                            },
                            transition: "0.3s",
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

                  {/* Quick Access */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    Quick Access
                  </Typography>
                  <Grid container spacing={2}>
                    {[
                      { title: "User Management", path: "/admin/users" },
                      { title: "System Config", path: "/admin/system" },
                      { title: "Troubleshooting", path: "/admin/troubleshoot" },
                      { title: "Logs & Backup", path: "/admin/logs" },
                      { title: "Notifications", path: "/admin/notifications" },
                      { title: "Analytics", path: "/admin/analytics" },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={2} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            textAlign: "center",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              transform: "scale(1.03)",
                            },
                            transition: "0.3s",
                          }}
                        >
                          <Typography fontWeight={600}>{item.title}</Typography>
                          <Button
                            size="small"
                            sx={{
                              mt: 2,
                              backgroundColor: "#7DA0FA",
                              color: "#fff",
                              "&:hover": { backgroundColor: "#4B49AC" },
                            }}
                            variant="contained"
                            onClick={() => navigate(item.path)}
                          >
                            Open
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Announcements */}
                  <Box sx={{ mt: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      color="#4B49AC"
                    >
                      System Announcements
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 3 }}>
                      <List>
                        {[
                          { text: "Server Maintenance - Nov 30th 02:00 AM" },
                          { text: "Security Patch Update - Dec 5th" },
                          { text: "Backup Audit - Dec 15th" },
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

            {/* Routes */}
            <Route path="profile" element={<Profile />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="system" element={<SystemConfig />} />
            <Route path="troubleshoot" element={<Troubleshooting />} />
            <Route path="logs" element={<SystemLogs />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="analytics" element={<Analytics />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default AdminDashboard;
