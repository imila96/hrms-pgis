// src/components/EmployeeDashboard/Profile.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

const emptyProfile = {
  id: "",
  name: "",
  email: "",
  contact: "",
  jobTitle: "",
  hireDate: "",
  address: "",
};

const Profile = () => {
  const [user, setUser] = useState(emptyProfile);
  const [tempUser, setTempUser] = useState(emptyProfile);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get("/hr/employees/me");
        setUser(data);
        setTempUser(data);
      } catch (e) {
        console.error(e);
        setSnack({ open: true, msg: "Failed to load profile", severity: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleEditToggle = () => {
    if (editMode) setTempUser(user); // discard changes
    setEditMode((v) => !v);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data } = await axiosInstance.put(`/hr/employees/${user.id}`, {
        ...tempUser,
      });
      setUser(data);
      setTempUser(data);
      setEditMode(false);
      setSnack({ open: true, msg: "Profile updated", severity: "success" });
    } catch (e) {
      console.error(e);
      setSnack({ open: true, msg: "Failed to update profile", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

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
          src={"https://i.pravatar.cc/150?img=3"}
          alt={user.name}
          sx={{ width: 96, height: 96, mr: 4, boxShadow: 2 }}
        />
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {user.name || "—"}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            {user.jobTitle || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email || "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user.contact || "—"}
          </Typography>
        </Box>
      </Box>

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
                Employee ID
              </Typography>
              <Typography variant="body1">{user.id ?? "—"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Hire Date
              </Typography>
              <Typography variant="body1">{user.hireDate || "—"}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Address
              </Typography>
              <Typography variant="body1">{user.address || "—"}</Typography>
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
                label="Employee ID"
                value={user.id}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={6} />
            <Grid item xs={12}>
              <TextField
                label="Full Name"
                name="name"
                value={tempUser.name}
                onChange={handleChange}
                fullWidth
                required
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
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Contact Number"
                name="contact"
                value={tempUser.contact}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Position"
                name="jobTitle"
                value={tempUser.jobTitle}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Hire Date"
                name="hireDate"
                type="date"
                value={tempUser.hireDate || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                name="address"
                value={tempUser.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="center" gap={3} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSave}
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleEditToggle}
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              Cancel
            </Button>
          </Box>
        </>
      )}

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Profile;
