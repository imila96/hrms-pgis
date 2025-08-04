// src/components/AdminDashboard/UserManagement/UserManagement.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

const initialUsers = [
  { id: 1, name: "Inzam Shahib", email: "inzam@pgis.lk", role: "Admin" },
  { id: 2, name: "Ayesha N.", email: "ayesha@pgis.lk", role: "HR Assistant" },
];

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState(null); // null = add mode, user obj = edit mode
  const [formData, setFormData] = useState({ name: "", email: "", role: "" });

  useEffect(() => {
    setUsers(initialUsers);
  }, []);

  // Open dialog for Add or Edit
  const openDialog = (user = null) => {
    setEditUser(user);
    setFormData(user ? { ...user } : { name: "", email: "", role: "" });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditUser(null);
    setFormData({ name: "", email: "", role: "" });
  };

  // Handle form field change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Save new or edited user
  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.role) {
      alert("Please fill all fields");
      return;
    }

    if (editUser) {
      // Edit existing user
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? { ...formData, id: u.id } : u))
      );
    } else {
      // Add new user with new id
      const newId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      setUsers((prev) => [...prev, { ...formData, id: newId }]);
    }
    closeDialog();
  };

  // Delete user
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        User Account Management
      </Typography>

      <Button variant="contained" onClick={() => openDialog()} sx={{ mb: 2 }}>
        Add New User
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Role</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}

            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => openDialog(user)}
                    aria-label="edit user"
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(user.id)}
                    aria-label="delete user"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>{editUser ? "Edit User" : "Add New User"}</DialogTitle>

        <DialogContent>
          <TextField
            label="Name"
            name="name"
            fullWidth
            margin="dense"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            fullWidth
            margin="dense"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Role"
            name="role"
            fullWidth
            margin="dense"
            value={formData.role}
            onChange={handleChange}
            required
            placeholder="e.g. Admin, HR Assistant"
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editUser ? "Save Changes" : "Add User"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
