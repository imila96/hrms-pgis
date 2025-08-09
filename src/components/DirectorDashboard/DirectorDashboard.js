// src/components/DirectorDashboard/DirectorDashboard.js
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
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Pages
import DirectorProfile from "./Profile";
import PolicyOversight from "./PolicyOversight";
import PersonnelOversight from "./PersonnelOversight";

// Optional: theme context like your other dashboards
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const drawerWidth = 240;
const tabs = [
  { label: "Profile", path: "/director/profile" },
  { label: "Policy Oversight", path: "/director/policies" },
  { label: "Personnel Oversight", path: "/director/personnel" },
];

export default function DirectorDashboard() {
  const { logout, user, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/");
  };
  const handleProfile = () => {
    handleMenuClose();
    navigate("/director/profile");
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
    setActiveRole(role);
    handleMenuClose();
    setTimeout(() => navigate(goToRoleHome(role)), 0);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap>
            Director Dashboard
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            <IconButton color="inherit">
              <Badge badgeContent={3} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>

            <Tooltip title="Account">
              <IconButton color="inherit" onClick={handleMenuOpen}>
                {user?.photoURL ? (
                  <Avatar src={user.photoURL} />
                ) : (
                  <Avatar>
                    {getInitials(user?.email) || <AccountCircleIcon />}
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

              {/* Role switcher */}
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

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: "auto" }}>
          <List>
            {tabs.map(({ label, path }) => (
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

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Routes>
          <Route path="profile" element={<DirectorProfile />} />
          <Route path="policies" element={<PolicyOversight />} />
          <Route path="personnel" element={<PersonnelOversight />} />
        </Routes>
      </Box>
    </Box>
  );
}
