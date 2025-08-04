import React, { useState } from "react";
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
} from "@mui/material";
import { Delete } from "@mui/icons-material";

const initialPolicies = [
  {
    id: 1,
    title: "Leave Policy",
    description: "Employees can take up to 20 days of paid leave annually.",
  },
  {
    id: 2,
    title: "Remote Work Policy",
    description: "Employees can work remotely up to 3 days per week.",
  },
];

const PolicyManagement = () => {
  const [policies, setPolicies] = useState(initialPolicies);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const handleAddPolicy = () => {
    if (!formData.title || !formData.description) {
      alert("Please fill all fields");
      return;
    }

    const newPolicy = {
      id: Date.now(),
      title: formData.title,
      description: formData.description,
    };

    setPolicies((prev) => [...prev, newPolicy]);
    setDialogOpen(false);
    setFormData({ title: "", description: "" });
  };

  const handleDeletePolicy = (id) => {
    if (window.confirm("Are you sure you want to delete this policy?")) {
      setPolicies(policies.filter((p) => p.id !== id));
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Policy Management</Typography>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Add Policy
        </Button>
      </Box>

      <List>
        {policies.map((policy) => (
          <ListItem
            key={policy.id}
            secondaryAction={
              <IconButton
                edge="end"
                color="error"
                onClick={() => handleDeletePolicy(policy.id)}
              >
                <Delete />
              </IconButton>
            }
          >
            <ListItemText
              primary={policy.title}
              secondary={policy.description}
            />
          </ListItem>
        ))}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add New Policy</DialogTitle>
        <DialogContent>
          <TextField
            label="Policy Title"
            name="title"
            fullWidth
            margin="dense"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            rows={4}
            margin="dense"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddPolicy}>
            Add Policy
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PolicyManagement;
