// src/components/EmployeeDashboard/Profile.js
import React from "react";
import { Box, Typography, Avatar, Paper, Grid } from "@mui/material";

const Profile = () => {
  // Dummy user data, you can replace with context or API data
  const user = {
    name: "Inzam Shahib",
    email: "inzamshahib0@gmail.com",
    position: "Software Engineer",
    phone: "+94 71 234 5678",
    avatarUrl: "https://i.pravatar.cc/150?img=3",
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <Avatar src={user.avatarUrl} alt={user.name} sx={{ width: 80, height: 80, mr: 3 }} />
        <Box>
          <Typography variant="h5">{user.name}</Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {user.position}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.phone}
          </Typography>
        </Box>
      </Box>
      <Typography variant="body1">
        Welcome to your profile page. Here you can update your personal information and view your details.
      </Typography>
    </Paper>
  );
};

export default Profile;
