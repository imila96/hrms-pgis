// src/components/common/TopNavBar.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  Tooltip,
  Switch,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { deepPurple } from "@mui/material/colors";

const TopNavBar = ({ title, currentPage }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
    document.body.setAttribute("data-theme", darkMode ? "light" : "dark");
  };

  return (
    <AppBar position="static" color="primary" enableColorOnDark>
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          {currentPage && (
            <Typography variant="body2" color="textSecondary">
              {currentPage}
            </Typography>
          )}
        </Box>

        <Box display="flex" alignItems="center" gap={2}>
          <Tooltip title="Toggle theme">
            <IconButton onClick={handleThemeToggle} color="inherit">
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="Profile settings">
            <IconButton onClick={handleMenuOpen}>
              {/* Replace with real user profile image when available */}
              <Avatar sx={{ bgcolor: deepPurple[500] }}>
                {user?.email?.[0]?.toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>{user?.email}</MenuItem>
            <MenuItem disabled>Role: {user?.role}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavBar;
