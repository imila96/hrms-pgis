// src/components/AdminDashboard/UserManagement/UserManagement.js
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  IconButton, Button, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel, Chip, Stack
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import api from "../../../AxiosInstance";


const ROLE_OPTIONS = ["ADMIN", "HR", "EMPLOYEE"];

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // add user dialog
  const [openAdd, setOpenAdd] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", password: "" });

  // assign role dialog
  const [openRole, setOpenRole] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [empFields, setEmpFields] = useState({ name: "", jobTitle: "", contact: "", address: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await api.get("/admin/users");
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  /* ------------------- Add user ------------------- */
  const saveUser = async () => {
    if (!addForm.email || addForm.password.length < 6) return alert("Email and password(>=6).");
    await api.post("/admin/users", addForm);
    setOpenAdd(false);
    setAddForm({ email: "", password: "" });
    load();
  };

  /* --------------- Assign/Change role -------------- */
  const openRoleDlg = (u) => {
    setRoleUser(u);
    setSelectedRole(u.roles[0] || "EMPLOYEE"); // default
    setEmpFields({
      name: u.hasEmployee ? "" : u.email,
      jobTitle: u.hasEmployee ? "" : "Staff",
      contact: "",
      address: ""
    });
    setOpenRole(true);
  };

  const saveRole = async () => {
    await api.put(`/admin/users/${roleUser.id}/roles`, {
      roles: [selectedRole],
      ...empFields
    });
    setOpenRole(false);
    setRoleUser(null);
    load();
  };

  /* -------------------- Delete --------------------- */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/admin/users/${id}`);
    load();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">User Account Management</Typography>
        <Button variant="contained" onClick={() => setOpenAdd(true)}>Add New User</Button>
      </Stack>

      <Paper>
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
                  {u.roles.length ? u.roles.map(r => <Chip key={r} label={r} size="small" sx={{ mr: 0.5 }}/>) : <em>None</em>}
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

      {/* Add user dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)}>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            label="Email" fullWidth margin="dense"
            value={addForm.email}
            onChange={e => setAddForm({ ...addForm, email: e.target.value })}
          />
          <TextField
            label="Password" type="password" fullWidth margin="dense"
            value={addForm.password}
            onChange={e => setAddForm({ ...addForm, password: e.target.value })}
            helperText="At least 6 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveUser}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Assign role dialog */}
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

          {/* minimal employee fields (used if employee row must be created) */}
          <TextField label="Name" fullWidth margin="dense"
            value={empFields.name} onChange={e => setEmpFields({ ...empFields, name: e.target.value })}/>
          <TextField label="Job Title" fullWidth margin="dense"
            value={empFields.jobTitle} onChange={e => setEmpFields({ ...empFields, jobTitle: e.target.value })}/>
          <TextField label="Contact" fullWidth margin="dense"
            value={empFields.contact} onChange={e => setEmpFields({ ...empFields, contact: e.target.value })}/>
          <TextField label="Address" fullWidth margin="dense"
            value={empFields.address} onChange={e => setEmpFields({ ...empFields, address: e.target.value })}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRole(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveRole}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
