// src/components/EmployeeDashboard/Leave.js
import React, { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";

const Leave = () => {
  const [leaves, setLeaves] = useState([
    { id: 1, type: "Sick Leave", startDate: "2025-06-15", endDate: "2025-06-17", status: "Approved" },
    { id: 2, type: "Casual Leave", startDate: "2025-07-05", endDate: "2025-07-07", status: "Pending" },
  ]);

  const [open, setOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({ type: "", startDate: "", endDate: "" });
  const [alertOpen, setAlertOpen] = useState(false);

  const leaveTypes = ["Casual Leave", "Sick Leave", "Maternity Leave", "Annual Leave"];

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setNewLeave({ ...newLeave, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (newLeave.type && newLeave.startDate && newLeave.endDate) {
      setLeaves([...leaves, { id: leaves.length + 1, ...newLeave, status: "Pending" }]);
      setNewLeave({ type: "", startDate: "", endDate: "" });
      setOpen(false);
      setAlertOpen(true);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 900 }}>
      <Typography variant="h6" gutterBottom>
        Leave Management
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Apply for Leave
      </Button>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Leave Type</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaves.map(({ id, type, startDate, endDate, status }) => (
              <TableRow key={id}>
                <TableCell>{type}</TableCell>
                <TableCell>{startDate}</TableCell>
                <TableCell>{endDate}</TableCell>
                <TableCell>{status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Leave Application Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Leave Type"
            name="type"
            value={newLeave.type}
            onChange={handleChange}
            fullWidth
            margin="normal"
          >
            {leaveTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Start Date"
            type="date"
            name="startDate"
            value={newLeave.startDate}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="End Date"
            type="date"
            name="endDate"
            value={newLeave.endDate}
            onChange={handleChange}
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!newLeave.type || !newLeave.startDate || !newLeave.endDate}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={alertOpen} autoHideDuration={4000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity="success" sx={{ width: "100%" }}>
          Leave application submitted!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Leave;
