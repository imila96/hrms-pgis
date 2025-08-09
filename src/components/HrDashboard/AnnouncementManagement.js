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
  DialogActions,
  TextField,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Add as AddIcon,
  Publish as PublishIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get(
        "http://localhost:8080/announcements"
      );
      setAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  const fetchAnnouncementDetails = async (id) => {
    try {
      const res = await axiosInstance.get(`/announcements/${id}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch announcement details", err);
      return null;
    }
  };

  const handleDialogOpen = async (id = null) => {
    if (id) {
      const detail = await fetchAnnouncementDetails(id);
      if (detail) {
        setEditingId(id);
        setFormData({
          title: detail.title,
          description: detail.description,
        });
      }
    } else {
      setEditingId(null);
      setFormData({ title: "", description: "" });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingId(null);
    setFormData({ title: "", description: "" });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      alert("Title and Description are required.");
      return;
    }

    try {
      if (editingId) {
        await axiosInstance.put(`/announcements/${editingId}`, formData);
      } else {
        await axiosInstance.post("/announcements", formData);
      }
      fetchAnnouncements();
      handleDialogClose();
    } catch (err) {
      console.error("Failed to save announcement", err);
    }
  };

  const handlePublish = async (id) => {
    if (!window.confirm("Are you sure you want to publish this announcement?"))
      return;
    try {
      await axiosInstance.patch(`/announcements/${id}/publish`);
      fetchAnnouncements();
    } catch (err) {
      console.error("Failed to publish announcement", err);
    }
  };

  const handleShowDetails = async (id) => {
    const detail = await fetchAnnouncementDetails(id);
    setSelectedAnnouncement(detail);
  };

  const formatDateTime = (dateTime) => {
    return dateTime ? new Date(dateTime).toLocaleString() : "N/A";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "default";
      case "PUBLISHED":
        return "success";
      case "ARCHIVED":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Announcement Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleDialogOpen()}
        >
          Add Announcement
        </Button>
      </Box>

      <List>
        {announcements.map((announcement) => (
          <ListItem
            key={announcement.id}
            button
            alignItems="flex-start"
            onClick={() => handleShowDetails(announcement.id)}
            secondaryAction={
              <Box display="flex" alignItems="center" gap={1}>
                <Tooltip title="Edit">
                  <IconButton
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDialogOpen(announcement.id);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                {announcement.status === "DRAFT" && (
                  <Tooltip title="Publish">
                    <IconButton
                      color="success"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePublish(announcement.id);
                      }}
                    >
                      <PublishIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            }
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  {announcement.title}
                  <Chip
                    label={announcement.status}
                    size="small"
                    color={getStatusColor(announcement.status)}
                  />
                </Box>
              }
              secondary={`Published At: ${formatDateTime(
                announcement.publishedAt
              )}`}
            />
          </ListItem>
        ))}
      </List>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {editingId ? "Edit Announcement" : "Add New Announcement"}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      {selectedAnnouncement && (
        <Dialog
          open={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        >
          <DialogTitle>Announcement Details</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1">
              <strong>Title:</strong> {selectedAnnouncement.title}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Description:</strong>
            </Typography>
            <Typography paragraph>
              {selectedAnnouncement.description}
            </Typography>
            <Typography>
              <strong>Status:</strong> {selectedAnnouncement.status}
            </Typography>
            <Typography>
              <strong>Created At:</strong>{" "}
              {formatDateTime(selectedAnnouncement.createdAt)}
            </Typography>
            <Typography>
              <strong>Created By:</strong> {selectedAnnouncement.createdBy}
            </Typography>
            <Typography>
              <strong>Published At:</strong>{" "}
              {formatDateTime(selectedAnnouncement.publishedAt)}
            </Typography>
            <Typography>
              <strong>Published By:</strong>{" "}
              {selectedAnnouncement.publishedBy || "N/A"}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedAnnouncement(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
};

export default AnnouncementManagement;
