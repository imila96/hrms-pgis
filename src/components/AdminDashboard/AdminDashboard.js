// src/components/AdminDashboard/AdminDashboard.js
import React, { useState, useContext } from "react";
import {
  Box,
  Drawer,
  Toolbar,
  Typography,
  AppBar,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Badge,
  useTheme,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { NavLink, useNavigate, Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Components
import SystemConfig from "./SystemConfig/SystemConfig";
import Troubleshooting from "./Troubleshooting/Troubleshooting";
import SystemLogs from "./SystemLogs/SystemLogs";
import Notifications from "./Notifications/Notifications";
import Analytics from "./Analytics/Analytics";
import UserManagement from "./UserManagement/UserManagement";
import Profile from "./Profile/Profile";

// Optional: create this context to handle theme toggle globally
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const drawerWidth = 240;

const tabItems = [
  { label: "Profile", path: "/admin/profile" },
  { label: "User Management", path: "/admin/users" },
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

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            Admin Dashboard
          </Typography>

          {/* Right side: Theme toggle, notifications, profile */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Theme Switch */}
            <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit">
              <Badge badgeContent={5} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Profile */}
            <Tooltip title="Profile">
              <IconButton color="inherit" onClick={handleMenuOpen}>
                {user?.photoURL ? (
                  <Avatar src={user.photoURL} />
                ) : (
                  <Avatar>
                    {getInitials(user?.name || user?.email) || <AccountCircleIcon />}
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

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {tabItems.map(({ label, path }) => (
              <ListItem
                button
                key={path}
                component={NavLink}
                to={path}
                sx={{ "&.active": { backgroundColor: "#e0e0e0" } }}
              >
                <ListItemText primary={label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
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
  );
};

export default AdminDashboard;
