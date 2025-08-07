import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState(user);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "http://localhost:8080/hr/employees/14"
      );
      const data = response.data;

      const mappedUser = {
        empID: `EMP${data.id.toString()}`,
        fullName: data.name,
        email: data.email,
        contactNumber: data.contact,
        department: "Human Resources", // if not from backend
        position: data.jobTitle,
        dateHired: data.hireDate,
        address: data.address,
      };
      console.log(mappedUser);
      setUser(mappedUser);
      setTempUser(mappedUser);
    } catch (err) {
      console.error(err);
      setError("Failed to load employee profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{ p: 5, maxWidth: 720, mx: "auto", mt: 5, textAlign: "center" }}
      >
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={fetchEmployee}>
          Retry
        </Button>
      </Paper>
    );
  }

  if (!user) {
    return (
      <Paper
        sx={{ p: 5, maxWidth: 720, mx: "auto", mt: 5, textAlign: "center" }}
      >
        <Typography variant="h6">No employee data found</Typography>
      </Paper>
    );
  }

  const handleEditToggle = () => {
    if (editMode) {
      setTempUser(user); // discard changes on cancel
      setEditMode(false);
      setFieldErrors({});
    } else {
      setEditMode(true);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!tempUser.fullName?.trim()) {
      errors.fullName = "Full name is required";
      isValid = false;
    }

    if (!tempUser.address?.trim()) {
      errors.fullName = "Full name is required";
      isValid = false;
    }

    if (!tempUser.email?.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(tempUser.email)) {
      errors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!tempUser.contactNumber?.trim()) {
      errors.contactNumber = "Contact number is required";
      isValid = false;
    }

    if (!tempUser.position?.trim()) {
      errors.position = "Position is required";
      isValid = false;
    }

    if (!tempUser.dateHired) {
      errors.dateHired = "Date hired is required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const id = parseInt(tempUser.empID.replace("EMP", ""));

      const employeeData = {
        id: id,
        name: tempUser.fullName,
        email: tempUser.email,
        contact: tempUser.contactNumber,
        jobTitle: tempUser.position,
        hireDate: tempUser.dateHired,
        address: tempUser.address,
      };

      const response = await axiosInstance.put(
        `http://localhost:8080/hr/employees/${id}`,
        employeeData
      );

      if (response.status === 200) {
        setUser(tempUser);
        setEditMode(false);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError("Failed to update employee profile.");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "An error occurred while saving the profile."
      );
    } finally {
      setLoading(false);
    }
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
      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Profile updated successfully!
        </Alert>
      </Snackbar>

      {/* Header with Avatar and basic info */}
      <Box
        display="flex"
        alignItems="center"
        mb={4}
        sx={{ borderBottom: 1, borderColor: "divider", pb: 3 }}
      >
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
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Employee ID
              </Typography>
              <Typography variant="body1">{user.empID}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Full Name
              </Typography>
              <Typography variant="body1">{user.fullName}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Address
              </Typography>
              <Typography variant="body1">{user.address}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Email
              </Typography>
              <Typography variant="body1">{user.email}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Contact No
              </Typography>
              <Typography variant="body1">{user.contactNumber}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Department
              </Typography>
              <Typography variant="body1">{user.department}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Position
              </Typography>
              <Typography variant="body1">{user.position}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
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
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Edit Profile"}
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
                name="empID"
                value={tempUser.empID}
                onChange={handleChange}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Full Name"
                name="fullName"
                value={tempUser.fullName}
                onChange={handleChange}
                fullWidth
                error={!!fieldErrors.fullName}
                helperText={fieldErrors.fullName}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Address"
                name="address"
                value={tempUser.address}
                onChange={handleChange}
                fullWidth
                error={!!fieldErrors.address}
                helperText={fieldErrors.address}
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
                error={!!fieldErrors.email}
                helperText={fieldErrors.email}
                required
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Contact Number"
                name="contactNumber"
                value={tempUser.contactNumber}
                onChange={handleChange}
                fullWidth
                error={!!fieldErrors.contactNumber}
                helperText={fieldErrors.contactNumber}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Department"
                name="department"
                value={tempUser.department}
                onChange={handleChange}
                fullWidth
                disabled
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Position"
                name="position"
                value={tempUser.position}
                onChange={handleChange}
                fullWidth
                error={!!fieldErrors.position}
                helperText={fieldErrors.position}
                required
                disabled
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
                error={!!fieldErrors.dateHired}
                helperText={fieldErrors.dateHired}
                required
                disabled
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="center" gap={3} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleSave}
              sx={{ minWidth: 120 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Save"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handleEditToggle}
              sx={{ minWidth: 120 }}
              disabled={loading}
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
