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
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Admin Subpages
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
  const {
    logout,
    user,
    setActiveRole,
    beginRoleTransition,
    endRoleTransition,
  } = useAuth();
  const navigate = useNavigate();
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

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

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
          position="sticky"
          elevation={3}
          sx={{
            background: "linear-gradient(135deg, #4B49AC 0%, #7DA0FA 100%)",
            color: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(75,73,172,0.25)",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
            {/* Title */}
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
              onClick={() => navigate("/admin")}
            >
              Admin Dashboard
            </Typography>

            {/* Tabs */}
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

            {/* Right actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Theme toggle */}
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

              {/* Notifications */}
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
                <Badge badgeContent={4} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Avatar */}
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
                      sx={{ width: 36, height: 36, border: "2px solid #98BDFF" }}
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
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
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
