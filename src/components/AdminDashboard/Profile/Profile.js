// src/components/EmployeeDashboard/Profile.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
} from "@mui/material";

const initialUser = {
  staffID: "EMP123456",
  fullName: "Bathiya Wimalasinghe",
  email: "bathiya0@gmail.com",
  contactNumber: "+94 71 234 5678",
  department: "administration",
  position: "System Administrator",
  dateHired: "2019-01-15",
  userID: "u004",
  avatarUrl: "https://i.pravatar.cc/150?img=3",
};

const Profile = () => {
  const [user, setUser] = useState(initialUser);
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState(user);

  const handleEditToggle = () => {
    if (editMode) {
      setTempUser(user); // discard changes on cancel
      setEditMode(false);
    } else {
      setEditMode(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // Add API call here if needed
    setUser(tempUser);
    setEditMode(false);
  };

  return (
    <Paper
      sx={{
        p: 5,
        maxWidth: 720,
        mx: "auto",
        mt: 5,
        boxShadow: 3,
        borderRadius: 3,
        backgroundColor: (theme) =>
          theme.palette.mode === "light" ? "#fafafa" : "#121212",
      }}
    >
      {/* Header with Avatar and basic info */}
      <Box
        display="flex"
        alignItems="center"
        mb={4}
        sx={{ borderBottom: 1, borderColor: "divider", pb: 3 }}
      >
        <Avatar
          src={user.avatarUrl}
          alt={user.fullName}
          sx={{ width: 96, height: 96, mr: 4, boxShadow: 2 }}
        />
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {user.fullName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {user.position}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.contactNumber}
          </Typography>
        </Box>
      </Box>

      {/* Main content area */}
      {!editMode ? (
        <>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
          >
            Employee Details
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Staff ID
              </Typography>
              <Typography variant="body1">{user.staffID}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                User ID
              </Typography>
              <Typography variant="body1">{user.userID}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Department
              </Typography>
              <Typography variant="body1">{user.department}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Date Hired
              </Typography>
              <Typography variant="body1">{user.dateHired}</Typography>
            </Grid>
          </Grid>

          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={handleEditToggle}
              sx={{ minWidth: 140 }}
            >
              Edit Profile
            </Button>
          </Box>
        </>
      ) : (
        <>
          <Typography
            variant="h6"
            sx={{ mb: 3, fontWeight: "medium", color: "primary.main" }}
          >
            Edit Profile
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <TextField
                label="Staff ID"
                name="staffID"
                value={tempUser.staffID}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="User ID"
                name="userID"
                value={tempUser.userID}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Full Name"
                name="fullName"
                value={tempUser.fullName}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={tempUser.email}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={tempUser.contactNumber}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Department"
                name="department"
                value={tempUser.department}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Position"
                name="position"
                value={tempUser.position}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Date Hired"
                name="dateHired"
                type="date"
                value={tempUser.dateHired}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>

          <Box
            display="flex"
            justifyContent="center"
            gap={3}
            sx={{ mt: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSave}
              sx={{ minWidth: 120 }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleEditToggle}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default Profile;
