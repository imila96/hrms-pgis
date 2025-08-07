// src/components/EmployeeDashboard/Complaints.js
import React, { useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";

const Complaints = () => {
  const [complaints, setComplaints] = useState([
    { id: 1, title: "Computer not working", description: "My computer frequently crashes.", status: "Open" },
    { id: 2, title: "Network issue", description: "Wi-Fi is slow in my area.", status: "Resolved" },
  ]);

  const [open, setOpen] = useState(false);
  const [newComplaint, setNewComplaint] = useState({ title: "", description: "" });
  const [alertOpen, setAlertOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setNewComplaint({ ...newComplaint, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (newComplaint.title && newComplaint.description) {
      setComplaints([...complaints, { id: complaints.length + 1, ...newComplaint, status: "Open" }]);
      setNewComplaint({ title: "", description: "" });
      setOpen(false);
      setAlertOpen(true);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom>
        Complaints / Technical Issues
      </Typography>
      <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
        Submit New Complaint
      </Button>

      <List>
        {complaints.map(({ id, title, description, status }) => (
          <ListItem key={id} divider>
            <ListItemText
              primary={`${title} (${status})`}
              secondary={description}
            />
          </ListItem>
        ))}
      </List>

      {/* Complaint Submission Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Submit Complaint</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            name="title"
            value={newComplaint.title}
            onChange={handleChange}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Description"
            name="description"
            value={newComplaint.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!newComplaint.title || !newComplaint.description}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar open={alertOpen} autoHideDuration={4000} onClose={() => setAlertOpen(false)}>
        <Alert onClose={() => setAlertOpen(false)} severity="success" sx={{ width: "100%" }}>
          Complaint submitted successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default Complaints;
