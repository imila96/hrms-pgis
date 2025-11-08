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

// Components
import EnhancedPersonnelOversight from "../DirectorDashboard/EnhancedPersonnelOversight";
import PolicyOversight from "../DirectorDashboard/PolicyOversight";
import AnnouncementManagement from "../DirectorDashboard/AnnouncementManagement";
import Attendance from "../DirectorDashboard/Attendance";
import Leave from "../DirectorDashboard/Leave";
import Complaints from "../DirectorDashboard/Complaints";
import Reports from "../DirectorDashboard/Reports";
import EmployeeDetail from "../DirectorDashboard/EmployeeDetail";

// Theme Context
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const tabItems = [
  { label: "Personnel Oversight", path: "/director/enhanced" },
  { label: "Policies", path: "/director/policies" },
  { label: "Announcements", path: "/director/announcements" },
  { label: "Attendance", path: "/director/attendance" },
  { label: "Leave", path: "/director/leave" },
  { label: "Complaints", path: "/director/complaints" },
  { label: "Reports", path: "/director/reports" },
];

const DirectorDashboard = () => {
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

  // Custom theme
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
          <Toolbar
            sx={{ display: "flex", justifyContent: "space-between", py: 1 }}
          >
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
              onClick={() => navigate("/director")}
            >
              Director Dashboard
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
                <Badge badgeContent={3} color="error">
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
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route
              index
              element={
                <Box sx={{ py: 3 }}>
                  {/* Welcome */}
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    Welcome back, {user?.name || "Director"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Role: Director • Department: Management
                  </Typography>

                  {/* Overview */}
                  <Grid container spacing={2} sx={{ my: 3 }}>
                    {[
                      {
                        title: "Total Employees",
                        value: "247",
                        subtitle: "Active staff across all divisions",
                      },
                      {
                        title: "Departments",
                        value: "6",
                        subtitle: "Operational units company-wide",
                      },
                      {
                        title: "Pending Reports",
                        value: "12",
                        subtitle: "Awaiting your review",
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

                  {/* Personnel Oversight */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    Personnel Oversight
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                      {
                        title: "Personal Oversight",
                        path: "/director/enhanced",
                      },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={3} key={idx}>
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
                      { title: "Policies", path: "/director/policies" },
                      {
                        title: "Announcements",
                        path: "/director/announcements",
                      },
                      { title: "Complaints", path: "/director/complaints" },
                      { title: "Reports", path: "/director/reports" },
                      { title: "Attendance", path: "/director/attendance" },
                      { title: "Leave", path: "/director/leave" },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={2.4} key={idx}>
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
                      Upcoming Announcements
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 3 }}>
                      <List>
                        {[
                          { text: "Quarterly Review - Nov 30th, HQ Boardroom" },
                          { text: "Budget Planning - Dec 15th, Finance Wing" },
                          { text: "Annual Conference - Jan 5th, Main Hall" },
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
            <Route path="enhanced" element={<EnhancedPersonnelOversight />} />
            <Route path="policies" element={<PolicyOversight />} />
            <Route path="announcements" element={<AnnouncementManagement />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="complaints" element={<Complaints />} />
            <Route path="reports" element={<Reports />} />
            <Route path="employee/:id" element={<EmployeeDetail />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DirectorDashboard;
