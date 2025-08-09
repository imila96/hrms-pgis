import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Tooltip,
} from "@mui/material";
import { Edit as EditIcon, Add as AddIcon } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    effectiveDate: "",
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axiosInstance.get("/policies");
      setPolicies(res.data);
    } catch (err) {
      console.error("Failed to fetch policies", err);
    }
  };

  const fetchPolicyDetails = async (id) => {
    try {
      const res = await axiosInstance.get(`/policies/${id}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch policy details", err);
      return null;
    }
  };

  const handleDialogOpen = async (id = null) => {
    if (id) {
      const detail = await fetchPolicyDetails(id);
      if (detail) {
        setEditingId(id);
        setFormData({
          title: detail.title,
          description: detail.description,
          effectiveDate: detail.effectiveDate || "",
        });
      }
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "", effectiveDate: "" });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "", effectiveDate: "" });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert("Please fill in title and description");
      return;
    }

    const payload = {
      ...formData,
      effectiveDate: formData.effectiveDate || null,
      status: null,
      createdBy: null,
      decidedBy: null,
      decidedAt: null,
    };

    try {
      if (editingId) {
        await axiosInstance.put(`/policies/${editingId}`, payload);
      } else {
        await axiosInstance.post("/policies", payload);
      }
      fetchPolicies();
      handleDialogClose();
    } catch (err) {
      console.error("Error saving policy", err);
    }
  };

  const handleShowDetails = async (id) => {
    const detail = await fetchPolicyDetails(id);
    setSelectedPolicy(detail);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Policy Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
        >
          Add Policy
        </Button>
      </Box>

      <List>
        {policies.map((policy) => (
          <ListItem
            key={policy.id}
            alignItems="flex-start"
            secondaryAction={
              <Box>
                <Tooltip title="Edit">
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation(); // 👈 Prevent bubbling to ListItem
                      handleDialogOpen(policy.id);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
            button
            onClick={() => handleShowDetails(policy.id)}
          >
            <ListItemText
              primary={`${policy.title} (${policy.status})`}
              secondary={`Effective Date: ${policy.effectiveDate || "N/A"}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {editingId ? "Edit Policy" : "Add New Policy"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="dense"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            margin="dense"
            multiline
            rows={4}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <TextField
            label="Effective Date (optional)"
            type="date"
            fullWidth
            margin="dense"
            InputLabelProps={{ shrink: true }}
            value={formData.effectiveDate}
            onChange={(e) =>
              setFormData({ ...formData, effectiveDate: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Policy Detail Viewer */}
      {selectedPolicy && (
        <Dialog
          open={Boolean(selectedPolicy)}
          onClose={() => setSelectedPolicy(null)}
        >
          <DialogTitle>Policy Details</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1">
              <strong>Title:</strong> {selectedPolicy.title}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Description:</strong>
            </Typography>
            <Typography paragraph>{selectedPolicy.description}</Typography>
            <Typography>
              <strong>Status:</strong> {selectedPolicy.status}
            </Typography>
            <Typography>
              <strong>Effective Date:</strong>{" "}
              {selectedPolicy.effectiveDate || "N/A"}
            </Typography>
            <Typography>
              <strong>Created By:</strong> {selectedPolicy.createdBy}
            </Typography>
            {selectedPolicy.decidedBy && (
              <>
                <Typography>
                  <strong>Decided By:</strong> {selectedPolicy.decidedBy}
                </Typography>
                <Typography>
                  <strong>Decided At:</strong>{" "}
                  {selectedPolicy.decidedAt?.replace("T", " ").slice(0, 16)}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedPolicy(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default PolicyManagement;
