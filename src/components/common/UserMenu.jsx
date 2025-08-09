import React, { useState } from "react";
import {
  Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText,
  Divider, Chip, Stack
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import CheckIcon from "@mui/icons-material/Check";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLE, roleHome, roleLabel } from "../../utils/roles";

export default function UserMenu() {
  const { user, roles, activeRole, switchRole } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const nav = useNavigate();

  const onSwitch = (r) => {
    if (switchRole(r)) {
      setAnchorEl(null);
      nav(roleHome[r] || "/");
    }
  };

  const items = [ROLE.EMPLOYEE, ROLE.ADMIN, ROLE.HR, ROLE.DIRECTOR].filter(r => roles?.includes(r));

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {activeRole && <Chip size="small" label={roleLabel(activeRole)} color="primary" variant="outlined" />}
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
        <Avatar sx={{ width: 36, height: 36 }}>{(user?.email || "U")[0].toUpperCase()}</Avatar>
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => { setAnchorEl(null); nav(`${roleHome[activeRole] || ""}/profile`); }}>
          <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon><ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); nav(`${roleHome[activeRole] || ""}/settings`); }}>
          <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon><ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled>
          <ListItemIcon><SwapHorizIcon fontSize="small" /></ListItemIcon><ListItemText>Switch Role</ListItemText>
        </MenuItem>
        {items.map(r => (
          <MenuItem key={r} onClick={() => onSwitch(r)} dense sx={{ pl: 5 }}>
            <ListItemIcon sx={{ minWidth: 28 }}>{activeRole === r ? <CheckIcon fontSize="small" /> : null}</ListItemIcon>
            <ListItemText>{roleLabel(r)}</ListItemText>
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); nav("/logout"); }}>
          <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon><ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
