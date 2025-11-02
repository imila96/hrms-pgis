import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import api from "../../../AxiosInstance";

const ROLE_OPTIONS = ["ADMIN", "HR", "EMPLOYEE","DIRECTOR"];

export default function UserManagement() {
  // main users table
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // pending employees (no user accounts yet)
  const [pendingEmployees, setPendingEmployees] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // assign password dialog (for creating user from employee)
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState(null); // {employeeId, email, name, jobTitle}
  const [initialPassword, setInitialPassword] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Email for the user account

  // assign role dialog
  const [openRole, setOpenRole] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  // (kept for UI only; will NOT be sent)
  const [empFields, setEmpFields] = useState({ name: "", jobTitle: "", contact: "", address: "" });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.filter(u => u.adminPasswordAssigned));
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async () => {
    setPendingLoading(true);
    try {
      const { data } = await api.get("/admin/users/pending-employees");
      setPendingEmployees(data);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadPending();
  }, []);

  /* ---------------- Create user for employee ---------------- */
  const openPwdDialog = (emp) => {
    setPwdTarget(emp);
    setUserEmail(emp.email || ""); // Pre-fill with employee email
    setInitialPassword("");
    setPwdOpen(true);
  };

  const createUserForEmployee = async () => {
    if (!pwdTarget?.employeeId) return;
    if (!userEmail || !userEmail.includes('@')) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!initialPassword || initialPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      await api.post("/admin/users/create-user-for-employee", {
        employeeId: pwdTarget.employeeId,
        email: userEmail,
        password: initialPassword,
        role: "EMPLOYEE" // Default role
      });
      setPwdOpen(false);
      setPwdTarget(null);
      setInitialPassword("");
      setUserEmail("");
      await Promise.all([loadUsers(), loadPending()]);
      alert("User account created successfully!");
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to create user account.");
    }
  };

  /* ---------------- Assign/Change role ---------------- */
  const openRoleDlg = (u) => {
    setRoleUser(u);
    setSelectedRole(u.roles[0] || "EMPLOYEE");
    setEmpFields({
      name: u.hasEmployee ? "" : u.email,
      jobTitle: u.hasEmployee ? "" : "Staff",
      contact: "",
      address: ""
    });
    setOpenRole(true);
  };

  // ✅ send ONLY roles; do not send employee fields
  const saveRole = async () => {
    try {
      await api.put(`/admin/users/${roleUser.id}/roles`, {
        roles: [selectedRole],
      });
      setOpenRole(false);
      setRoleUser(null);
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to save role.");
    }
  };

  /* ---------------- Delete user ---------------- */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      await Promise.all([loadUsers(), loadPending()]);
    } catch (e) {
      console.error(e);
      alert("Failed to delete user.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>User Account Management</Typography>

      {/* ===== Table 1: Users ===== */}
      <Paper sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Roles</strong></TableCell>
              <TableCell><strong>Employee Row</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={5} align="center">Loading…</TableCell></TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center">No users</TableCell></TableRow>
            )}
            {!loading && users.map(u => (
              <TableRow key={u.id}>
                <TableCell>{u.id}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {u.roles.length
                    ? u.roles.map(r => <Chip key={r} label={r} size="small" sx={{ mr: 0.5 }} />)
                    : <em>None</em>}
                </TableCell>
                <TableCell>{u.hasEmployee ? "Yes" : "No"}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => openRoleDlg(u)} title="Assign/Edit Role">
                    <Edit />
                  </IconButton>
                  <IconButton color="error" onClick={() => deleteUser(u.id)} title="Delete">
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* ===== Table 2: Pending Employee Accounts (employees without users) ===== */}
      <Typography variant="h6" mb={1}>Pending Employee Accounts (Need User Creation)</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Employee ID</strong></TableCell>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell align="right"><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingLoading && (
              <TableRow><TableCell colSpan={6} align="center">Loading…</TableCell></TableRow>
            )}
            {!pendingLoading && pendingEmployees.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center">No pending employees.</TableCell></TableRow>
            )}
            {!pendingLoading && pendingEmployees.map(emp => (
              <TableRow key={emp.employeeId}>
                <TableCell>{emp.employeeId}</TableCell>
                <TableCell>{emp.name || "-"}</TableCell>
                <TableCell>{emp.email || "-"}</TableCell>
                <TableCell>{emp.jobTitle || "-"}</TableCell>
                <TableCell>{emp.contact || "-"}</TableCell>
                <TableCell align="right">
                  <Button variant="contained" color="primary" onClick={() => openPwdDialog(emp)}>
                    Create User Account
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* ===== Create User Dialog ===== */}
      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create User Account for Employee</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Employee: <strong>{pwdTarget?.name}</strong> ({pwdTarget?.jobTitle})
            </Typography>
            <TextField
              label="User Email"
              type="email"
              fullWidth
              margin="normal"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              helperText="Email address for login"
              required
            />
            <TextField
              label="Initial Password"
              type="password"
              fullWidth
              margin="normal"
              value={initialPassword}
              onChange={e => setInitialPassword(e.target.value)}
              helperText="At least 6 characters"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={createUserForEmployee}
            disabled={!userEmail || !initialPassword || initialPassword.length < 6}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Assign Role Dialog (fields disabled) ===== */}
      <Dialog open={openRole} onClose={() => setOpenRole(false)}>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel id="role">Role</InputLabel>
            <Select
              labelId="role" label="Role"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              {ROLE_OPTIONS.map(r => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </FormControl>

          {/* Show but disabled so only role can be changed */}
          <TextField
            label="Name" fullWidth margin="dense"
            value={empFields.name}
            onChange={e => setEmpFields({ ...empFields, name: e.target.value })}
            disabled
          />
          <TextField
            label="Job Title" fullWidth margin="dense"
            value={empFields.jobTitle}
            onChange={e => setEmpFields({ ...empFields, jobTitle: e.target.value })}
            disabled
          />
          <TextField
            label="Contact" fullWidth margin="dense"
            value={empFields.contact}
            onChange={e => setEmpFields({ ...empFields, contact: e.target.value })}
            disabled
          />
          <TextField
            label="Address" fullWidth margin="dense"
            value={empFields.address}
            onChange={e => setEmpFields({ ...empFields, address: e.target.value })}
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRole(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveRole}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}