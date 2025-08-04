import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const initialEmployees = [
  { id: 1, name: "Nuwan Perera", email: "nuwan@company.com", position: "Software Engineer" },
  { id: 2, name: "Shehani Silva", email: "shehani@company.com", position: "HR Manager" },
];

const EmployeeRecords = () => {
  const [employees, setEmployees] = useState(initialEmployees);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", position: "" });

  const openDialog = (emp = null) => {
    setEditEmp(emp);
    setFormData(emp ? { ...emp } : { name: "", email: "", position: "" });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditEmp(null);
    setFormData({ name: "", email: "", position: "" });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.position) {
      alert("Please fill all fields");
      return;
    }

    if (editEmp) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === editEmp.id ? { ...formData, id: e.id } : e))
      );
    } else {
      const newId = employees.length ? Math.max(...employees.map((e) => e.id)) + 1 : 1;
      setEmployees((prev) => [...prev, { ...formData, id: newId }]);
    }

    closeDialog();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      setEmployees(employees.filter((e) => e.id !== id));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Employee Record Management
      </Typography>

      <Button variant="contained" onClick={() => openDialog()} sx={{ mb: 2 }}>
        Add New Employee
      </Button>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">No employee records.</TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.position}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => openDialog(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(emp.id)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>{editEmp ? "Edit Employee" : "Add New Employee"}</DialogTitle>
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
            fullWidth
            margin="dense"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <TextField
            label="Position"
            name="position"
            fullWidth
            margin="dense"
            value={formData.position}
            onChange={handleChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editEmp ? "Save Changes" : "Add Employee"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeRecords;
