/**
 * Profile.js
 * 
 * Enhanced Employee Profile matching HR design system.
 * UI improvements: gradient header, smooth animations, better spacing.
 * Business logic unchanged - all API calls and state management intact.
 */

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
} from "@mui/material";
import { Person, Email, Phone, Home, Work, CalendarToday, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";

const toViewModel = (e) => ({
  empID: `EMP${e.id}`,
  id: e.id,
  fullName: e.name ?? "",
  email: e.email ?? "",
  contactNumber: e.contact ?? "",
  department: e.department ?? "—",
  position: e.jobTitle ?? "—",
  dateHired: e.hireDate ?? "",
  address: e.address ?? "",
});

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [temp, setTemp] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosInstance.get("/hr/employees/me");
        const vm = toViewModel(data);
        setUser(vm);
        setTemp(vm);
      } catch (e) {
        setSnack({ open: true, msg: "Failed to load profile", sev: "error" });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setSaving(true);
      await axiosInstance.put(`/hr/employees/${user.id}`, {
        id: user.id,
        name: temp.fullName,
        email: user.email, // read-only, keep same
        contact: temp.contactNumber,
        jobTitle: user.position, // read-only
        hireDate: user.dateHired, // read-only
        address: temp.address,
      });
      setUser({ ...temp });
      setEdit(false);
      setSnack({ open: true, msg: "Profile updated successfully!", sev: "success" });
    } catch (e) {
      setSnack({ open: true, msg: "Update failed", sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          height: 400,
          animation: "fadeIn 0.3s ease-out",
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      >
        <CircularProgress size={60} sx={{ color: "#4B49AC" }} />
      </Box>
    );
  }
  if (!user) return null;

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <Box
      sx={{
        animation: "slideUp 0.4s ease-out",
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      }}
    >
      <BackButton />
      {/* Header Card */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #4B49AC 0%, #7DA0FA 100%)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(75,73,172,0.3)",
        }}
      >
        <Box display="flex" alignItems="center" gap={3} flexWrap="wrap">
          <Avatar
            sx={{
              width: 100,
              height: 100,
              bgcolor: "#98BDFF",
              fontSize: "2.5rem",
              fontWeight: 700,
              border: "4px solid #fff",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            }}
          >
            {getInitials(user.fullName)}
          </Avatar>
          <Box flex={1}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              {user.fullName}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap" mt={1}>
              <Chip
                icon={<Work sx={{ color: "#fff !important" }} />}
                label={user.position}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                }}
              />
              <Chip
                icon={<CalendarToday sx={{ color: "#fff !important" }} />}
                label={`Since ${user.dateHired || "N/A"}`}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  backdropFilter: "blur(10px)",
                }}
              />
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Main Profile Card */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(75,73,172,0.12)",
          },
        }}
      >
        {!edit ? (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
              pb={2}
              borderBottom="2px solid #f0f1f5"
            >
              <Typography variant="h5" fontWeight={700} color="#4B49AC">
                Employee Information
              </Typography>
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/employee/reset-password")}
                  startIcon={<Lock />}
                  sx={{
                    borderColor: "#7DA0FA",
                    color: "#7DA0FA",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": {
                      borderColor: "#4B49AC",
                      bgcolor: "#f8f9ff",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(75,73,172,0.2)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Change Password
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setEdit(true)}
                  sx={{
                    bgcolor: "#4B49AC",
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    "&:hover": {
                      bgcolor: "#3d3a8f",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(75,73,172,0.3)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#f8f9ff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f0f2ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person sx={{ color: "#4B49AC" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Employee ID
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.empID}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#f8f9ff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f0f2ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Person sx={{ color: "#4B49AC" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Full Name
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.fullName}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#f8f9ff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f0f2ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Email sx={{ color: "#7DA0FA" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Email
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.email || "—"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#f8f9ff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f0f2ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Phone sx={{ color: "#7DA0FA" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Contact Number
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.contactNumber || "—"}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#f8f9ff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f0f2ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Work sx={{ color: "#7978E9" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Department
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.department}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#f8f9ff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f0f2ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Work sx={{ color: "#7978E9" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Position
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.position}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: "#f8f9ff",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      bgcolor: "#f0f2ff",
                      transform: "translateX(4px)",
                    },
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Home sx={{ color: "#F3797E" }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Address
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600}>
                    {user.address || "—"}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
              pb={2}
              borderBottom="2px solid #f0f1f5"
            >
              <Typography variant="h5" fontWeight={700} color="#4B49AC">
                Edit Profile
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee ID"
                  value={user.empID}
                  fullWidth
                  disabled
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Date Hired"
                  value={user.dateHired || ""}
                  fullWidth
                  disabled
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Full Name"
                  fullWidth
                  value={temp.fullName}
                  onChange={(e) => setTemp({ ...temp, fullName: e.target.value })}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  fullWidth
                  value={user.email}
                  disabled
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Number"
                  fullWidth
                  value={temp.contactNumber}
                  onChange={(e) => setTemp({ ...temp, contactNumber: e.target.value })}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Department"
                  fullWidth
                  value={user.department}
                  disabled
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Position"
                  fullWidth
                  value={user.position}
                  disabled
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  fullWidth
                  multiline
                  rows={3}
                  value={temp.address}
                  onChange={(e) => setTemp({ ...temp, address: e.target.value })}
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box display="flex" justifyContent="center" gap={2} mt={4}>
              <Button
                variant="contained"
                onClick={onSave}
                disabled={saving}
                sx={{
                  bgcolor: "#4B49AC",
                  minWidth: 140,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "#3d3a8f",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(75,73,172,0.3)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {saving ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Save Changes"}
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setTemp(user);
                  setEdit(false);
                }}
                disabled={saving}
                sx={{
                  borderColor: "#7DA0FA",
                  color: "#7DA0FA",
                  minWidth: 140,
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  "&:hover": {
                    borderColor: "#4B49AC",
                    bgcolor: "#f8f9ff",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Cancel
              </Button>
            </Box>
          </>
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.sev}
          sx={{
            width: "100%",
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
