// src/components/DirectorDashboard/Profile.js
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
} from "@mui/material";
import api from "../../AxiosInstance";

const mapVM = (e) => ({
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

export default function DirectorProfile() {
  const [user, setUser] = useState(null);
  const [temp, setTemp] = useState(null);
  const [edit, setEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/hr/employees/me");
        const vm = mapVM(data);
        setUser(vm);
        setTemp(vm);
      } catch {
        setSnack({
          open: true,
          msg:
            "No editable employee profile found. Ask HR to create/link an Employee record for this account.",
          sev: "warning",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setSaving(true);
      await api.put(`/hr/employees/${user.id}`, {
        id: user.id,
        name: temp.fullName,
        email: user.email, // keep read-only
        contact: temp.contactNumber,
        jobTitle: user.position, // read-only here
        hireDate: user.dateHired, // read-only here
        address: temp.address,
      });
      setUser({ ...temp });
      setEdit(false);
      setSnack({ open: true, msg: "Profile updated", sev: "success" });
    } catch {
      setSnack({ open: true, msg: "Update failed", sev: "error" });
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
  if (!user) return null;

  return (
    <Paper
      sx={{ p: 5, maxWidth: 720, mx: "auto", mt: 5, boxShadow: 3, borderRadius: 3 }}
    >
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

      {!edit ? (
        <>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: "medium", color: "primary.main" }}
          >
            Employee Details
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Employee ID
              </Typography>
              <Typography>{user.empID}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Date Hired
              </Typography>
              <Typography>{user.dateHired || "—"}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Department
              </Typography>
              <Typography>{user.department}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Position
              </Typography>
              <Typography>{user.position}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              <Typography>{user.address || "—"}</Typography>
            </Grid>
          </Grid>

          <Box textAlign="center">
            <Button
              variant="contained"
              size="large"
              onClick={() => setEdit(true)}
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
              <TextField label="Employee ID" value={user.empID} fullWidth disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Date Hired" value={user.dateHired || ""} fullWidth disabled />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Full Name"
                fullWidth
                value={temp.fullName}
                onChange={(e) => setTemp({ ...temp, fullName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Email" fullWidth value={user.email} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Contact Number"
                fullWidth
                value={temp.contactNumber}
                onChange={(e) => setTemp({ ...temp, contactNumber: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Department" fullWidth value={user.department} disabled />
            </Grid>
            <Grid item xs={6}>
              <TextField label="Position" fullWidth value={user.position} disabled />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Address"
                fullWidth
                multiline
                rows={3}
                value={temp.address}
                onChange={(e) => setTemp({ ...temp, address: e.target.value })}
              />
            </Grid>
          </Grid>

          <Box display="flex" justifyContent="center" gap={3}>
            <Button
              variant="contained"
              onClick={onSave}
              disabled={saving}
              sx={{ minWidth: 120 }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setTemp(user);
                setEdit(false);
              }}
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
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
