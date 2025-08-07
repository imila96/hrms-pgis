import React, { useState, useEffect } from "react";
import axios from "axios";
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
import axiosInstance from "../../AxiosInstance";

const EmployeeRecords = () => {
  const [employees, setEmployees] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    jobTitle: "",
    hireDate: "",
    address: "",
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:8080/hr/employees"
      );
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const openDialog = (emp = null) => {
    setEditEmp(emp);
    setFormData(
      emp
        ? { ...emp }
        : {
            name: "",
            email: "",
            contact: "",
            jobTitle: "",
            hireDate: "",
            address: "",
          }
    );
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditEmp(null);
    setFormData({
      name: "",
      email: "",
      contact: "",
      jobTitle: "",
      hireDate: "",
      address: "",
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    try {
      if (editEmp) {
        await axiosInstance.put(
          `http://localhost:8080/hr/employees/${editEmp.id}`,
          formData
        );
      } else {
        await axiosInstance.post(
          "http://localhost:8080/hr/employees",
          formData
        );
      }
      fetchEmployees();
      closeDialog();
    } catch (error) {
      console.error("Error saving employee:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await axiosInstance.delete(`http://localhost:8080/hr/employees/${id}`);
        fetchEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
      }
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
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Contact</strong>
              </TableCell>
              <TableCell>
                <strong>Job Title</strong>
              </TableCell>
              <TableCell>
                <strong>Hire Date</strong>
              </TableCell>
              <TableCell>
                <strong>Address</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No employee records.
                </TableCell>
              </TableRow>
            ) : (
              employees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.contact}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>{emp.hireDate}</TableCell>
                  <TableCell>{emp.address}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => openDialog(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(emp.id)}
                    >
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
        <DialogTitle>
          {editEmp ? "Edit Employee" : "Add New Employee"}
        </DialogTitle>
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
            label="Contact"
            name="contact"
            fullWidth
            margin="dense"
            value={formData.contact}
            onChange={handleChange}
            required
          />
          <TextField
            label="Job Title"
            name="jobTitle"
            fullWidth
            margin="dense"
            value={formData.jobTitle}
            onChange={handleChange}
            required
          />
          <TextField
            label="Hire Date"
            name="hireDate"
            type="date"
            fullWidth
            margin="dense"
            value={formData.hireDate}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            margin="dense"
            value={formData.address}
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
