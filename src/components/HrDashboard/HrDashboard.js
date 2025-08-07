// src/components/HrDashboard/HrDashboard.js
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
import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Components
import EmployeeRecords from "./EmployeeRecords";
import LeaveManagement from "./LeaveManagement";
import AttendanceTracking from "./AttendanceTracking";
import RecruitmentManagement from "./RecruitmentManagement";
import PolicyManagement from "./PolicyManagement";
import Profile from "./Profile";

// Optional: theme context
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const drawerWidth = 240;

const tabItems = [
  { label: "Profile", path: "/hr/profile" },
  { label: "Employee Records", path: "/hr/records" },
  { label: "Leave Management", path: "/hr/leave" },
  { label: "Attendance Tracking", path: "/hr/attendance" },
  { label: "Recruitment", path: "/hr/recruitment" },
  { label: "Policies", path: "/hr/policies" },
];

const HrDashboard = () => {
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
    navigate("/hr/profile");
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
            HR Dashboard
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Theme Toggle */}
            <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {/* Notifications */}
            <IconButton color="inherit">
              <Badge badgeContent={2} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            {/* Avatar */}
            <Tooltip title="Account settings">
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
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: "border-box" },
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
          <Route path="records" element={<EmployeeRecords />} />
          <Route path="leave" element={<LeaveManagement />} />
          <Route path="attendance" element={<AttendanceTracking />} />
          <Route path="recruitment" element={<RecruitmentManagement />} />
          <Route path="policies" element={<PolicyManagement />} />
        </Routes>
      </Box>
    </Box>
  );
};

export default HrDashboard;
