// For now only 3 services available in backend related to recruitment management.(getAllOpening, createJob and closeJob)
// So hrstaff can create new job opening, and edit jobs which has status open only. delete is not required.

import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";

const RecruitmentManagement = () => {
  const [jobOpening, setJobOpening] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    status: "",
  });
  const [editJobOpening, setEditJobOpening] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Snackbar states
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  useEffect(() => {
    fetchJobOpenings();
  }, []);

  const fetchJobOpenings = async () => {
    try {
      const response = await axiosInstance.get(
        "http://localhost:8080/hr/recruitment/openings"
      );
      setJobOpening(response.data);
    } catch (error) {
      console.error("Error fetching job openings", error);
      if (error.response && error.response.status === 403) {
        showSnackbar("Access denied. Please log in again.", "error");
      }
    }
  };

  const showSnackbar = (message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const openDialog = (job = null) => {
    setEditJobOpening(job);
    setFormData(
      job
        ? {
            title: job.title,
            description: job.description,
            department: job.department,
            status: job.active ? "Open" : "Closed",
          }
        : { title: "", description: "", department: "", status: "" }
    );
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditJobOpening(null);
    setFormData({
      title: "",
      description: "",
      department: "",
      status: "",
    });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (!formData.status) {
      showSnackbar("Please select a status", "warning");
      return;
    }

    try {
      if (editJobOpening) {
        const originalStatus = editJobOpening.active ? "Open" : "Closed";

        if (formData.status === originalStatus) {
          showSnackbar("No changes detected", "info");
          return;
        }

        if (formData.status === "Closed" && editJobOpening.active) {
          await axiosInstance.put(`/hr/recruitment/close/${editJobOpening.id}`);
          showSnackbar("Job status updated to Closed", "success");
        } else {
          showSnackbar("Only closing open jobs is allowed", "info");
        }
      } else {
        const newJob = {
          title: formData.title,
          description: formData.description,
          department: formData.department,
          active: formData.status === "Open",
        };
        await axiosInstance.post("/hr/recruitment/create", newJob);
        showSnackbar("Job opening created successfully!", "success");
      }

      fetchJobOpenings();
      closeDialog();
    } catch (error) {
      console.error("Error saving job opening", error);
      showSnackbar("Failed to save job opening.", "error");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Job Opening?")) {
      setJobOpening(jobOpening.filter((job) => job.id !== id));
      showSnackbar("Job opening deleted (client-side only)", "info");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Job Openings
      </Typography>
      <Button variant="contained" onClick={() => openDialog()} sx={{ mb: 2 }}>
        New Job Opening
      </Button>

      <Paper sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Job Title</strong>
              </TableCell>
              <TableCell>
                <strong>Description</strong>
              </TableCell>
              <TableCell>
                <strong>Department</strong>
              </TableCell>
              <TableCell>
                <strong>Status</strong>
              </TableCell>
              <TableCell>
                <strong>Posted Date</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {jobOpening.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No job opening records.
                </TableCell>
              </TableRow>
            ) : (
              jobOpening.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>{job.title}</TableCell>
                  <TableCell>{job.description}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.active ? "Open" : "Closed"}</TableCell>
                  <TableCell>
                    {new Date(job.postedDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => openDialog(job)}
                      disabled={!job.active}
                    >
                      <Edit />
                    </IconButton>
                    {/* <IconButton
                      color="error"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Delete />
                    </IconButton> */}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {editJobOpening ? "Edit Job Opening" : "Add New Job Opening"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            name="title"
            margin="dense"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={!!editJobOpening}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="dense"
            value={formData.description}
            onChange={handleChange}
            required
            disabled={!!editJobOpening}
          />
          <TextField
            label="Department"
            name="department"
            fullWidth
            margin="dense"
            value={formData.department}
            onChange={handleChange}
            required
            disabled={!!editJobOpening}
          />

          <Select
            fullWidth
            name="status"
            value={formData.status}
            onChange={handleChange}
            margin="dense"
            displayEmpty
            required
            sx={{ mt: 2 }}
          >
            <MenuItem value="">
              <em>Select status</em>
            </MenuItem>
            <MenuItem value="Open">Open</MenuItem>
            <MenuItem value="Closed">Closed</MenuItem>
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editJobOpening ? "Save Changes" : "Add New Job Opening"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecruitmentManagement;
