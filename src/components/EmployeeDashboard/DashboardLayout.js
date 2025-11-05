/**
 * DashboardLayout.js
 * 
 * Enhanced Employee Dashboard layout matching HR design system.
 * UI enhancements: gradient AppBar, sticky header, polished nav, animations.
 * Business logic unchanged - all routing, auth, and state intact.
 */

// src/components/EmployeeDashboard/DashboardLayout.js
import React, { useState, useContext } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  Badge,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Brightness4,
  Notifications as NotificationsIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Optional: Create this context to handle theme toggle
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const menuItems = [
  { label: "Overview", path: "/employee" },
  { label: "Profile", path: "/employee/profile" },
  { label: "Attendance", path: "/employee/attendance" },
  { label: "My Leaves", path: "/employee/leave" },
  { label: "Policies", path: "/employee/policies" },
  { label: "Complaints", path: "/employee/complaints" },
  { label: "Reports", path: "/employee/reports" },
];

const DashboardLayout = () => {
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const open = Boolean(anchorEl);

  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/employee/profile");
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

  // Custom theme matching HR dashboard
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
        default: "#f0f1f5ff",
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
        {/* Enhanced Header AppBar */}
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
            {/* Left: Title + Role Badge */}
            <Box display="flex" alignItems="center" gap={2}>
              {isMobile && (
                <IconButton
                  color="inherit"
                  onClick={toggleMobileMenu}
                  sx={{ mr: 1 }}
                  aria-label="Open navigation menu"
                >
                  <MenuIcon />
                </IconButton>
              )}
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
                onClick={() => navigate("/employee")}
              >
                Employee Dashboard
              </Typography>
              {!isMobile && (
                <Badge
                  badgeContent="Employee"
                  sx={{
                    "& .MuiBadge-badge": {
                      bgcolor: "#7978E9",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                    },
                  }}
                />
              )}
            </Box>

            {/* Center: Compact Navigation (Desktop only) */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
              {menuItems.slice(0, 5).map((item) => (
                <Button
                  key={item.path}
                  component={NavLink}
                  to={item.path}
                  end={item.path === "/employee"}
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#E6E9FF",
                    borderRadius: "8px",
                    px: 2,
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
                  {item.label}
                </Button>
              ))}
            </Box>

            {/* Right: Actions */}
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

              {/* Profile Avatar */}
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
                <MenuItem onClick={handleProfile}>Profile</MenuItem>

                {/* Role switcher */}
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

        {/* Mobile Drawer */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={toggleMobileMenu}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: 250,
              bgcolor: "#4B49AC",
              color: "#fff",
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Navigation
            </Typography>
          </Box>
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={NavLink}
                to={item.path}
                end={item.path === "/employee"}
                onClick={toggleMobileMenu}
                sx={{
                  color: "#E6E9FF",
                  "&.active": {
                    bgcolor: "#F3797E",
                    color: "#fff",
                  },
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            backgroundColor: "#f0f1f5ff",
            maxWidth: "1400px",
            width: "100%",
            mx: "auto",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default DashboardLayout;
