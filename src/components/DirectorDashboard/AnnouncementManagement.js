// src/components/EmployeeDashboard/AnnouncementView.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

const AnnouncementView = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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
      case "UPCOMING":
        return "info";
      case "ARCHIVED":
        return "warning";
      default:
        return "default";
    }
  };

  const now = new Date();
  const upcomingAnnouncements = announcements.filter(
    (a) => a.publishedAt && new Date(a.publishedAt) > now
  );
  const publishedAnnouncements = announcements.filter(
    (a) => a.publishedAt && new Date(a.publishedAt) <= now
  );

  return (
    <Paper sx={{ p: 3 }}>
      {/* ===== HEADER ===== */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Announcements</Typography>
      </Box>

      {/* ===== UPCOMING ANNOUNCEMENTS ===== */}
      <Typography variant="h6" sx={{ mb: 1, color: "#4B49AC" }}>
        Upcoming Announcements
      </Typography>
      <List sx={{ mb: 3 }}>
        {upcomingAnnouncements.length === 0 ? (
          <Typography sx={{ color: "text.secondary", ml: 2 }}>
            No upcoming announcements
          </Typography>
        ) : (
          upcomingAnnouncements.map((announcement) => (
            <React.Fragment key={announcement.id}>
              <ListItem
                button
                alignItems="flex-start"
                onClick={() => handleShowDetails(announcement.id)}
              >
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      {announcement.title}
                      <Chip label="Upcoming" size="small" color="info" />
                    </Box>
                  }
                  secondary={`Scheduled for: ${formatDateTime(
                    announcement.publishedAt
                  )}`}
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* ===== CURRENT / PUBLISHED ANNOUNCEMENTS ===== */}
      <Typography variant="h6" sx={{ mb: 1, color: "#4B49AC" }}>
        Published Announcements
      </Typography>
      <List>
        {publishedAnnouncements.length === 0 ? (
          <Typography sx={{ color: "text.secondary", ml: 2 }}>
            No published announcements
          </Typography>
        ) : (
          publishedAnnouncements.map((announcement) => (
            <React.Fragment key={announcement.id}>
              <ListItem
                button
                alignItems="flex-start"
                onClick={() => handleShowDetails(announcement.id)}
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
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* ===== DETAILS DIALOG ===== */}
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
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
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

export default AnnouncementView;
