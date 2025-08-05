import React, { useState } from "react";
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
} from "@mui/material";
import { computeHeadingLevel } from "@testing-library/dom";
import { Delete, Edit } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";
import { useEffect } from "react";

const initialApplications = [
  {
    id: 1,
    title: "lecture",
    description: "Machine learning lecture",
    department: "Computer Science",
    status: "open",
    postedDate: "2024/10/15",
  },
  {
    id: 2,
    title: "lecture",
    description: "Machine learning lecture",
    department: "Computer Science",
    status: "open",
    postedDate: "2024/10/15",
  },
  {
    id: 3,
    title: "lecture",
    description: "Machine learning lecture",
    department: "Computer Science",
    status: "open",
    postedDate: "2024/10/15",
  },
];

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
        alert("Access denied. Please log in again.");
      }
    }
  };

  const openDialog = (job = null) => {
    setEditJobOpening(job);
    setFormData(
      job
        ? { ...job }
        : { title: "", description: "", department: "", status: "" }
    );
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditJobOpening(null);
    setFormData({ name: "", email: "", position: "" });
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.description ||
      !formData.department ||
      !formData.status
    ) {
      alert("Please fill all fields");
      return;
    }

    const newJob = {
      title: formData.title,
      description: formData.description,
      department: formData.department,
      status: formData.status,
    };

    try {
      if (editJobOpening) {
        alert("Update not implemented yet");
      } else {
        await axiosInstance.post("/hr/recruitment/create", newJob);

        fetchJobOpenings();
      }
      closeDialog();
    } catch (error) {
      console.error("Error saving job opening", error);
      alert("Failed to save job opening.");
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this Job Opening?")) {
      setJobOpening(jobOpening.filter((job) => job.id !== id));
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
                <TableCell colSpan={4} align="center">
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
                    <IconButton color="primary" onClick={() => openDialog(job)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(job.id)}
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
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="dense"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <TextField
            label="Department"
            name="department"
            fullWidth
            margin="dense"
            value={formData.department}
            onChange={handleChange}
            required
          />
          <TextField
            label="Status"
            name="status"
            fullWidth
            margin="dense"
            value={formData.status}
            onChange={handleChange}
            required
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editJobOpening ? "Save Changes" : "Add New Job Opening"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecruitmentManagement;
