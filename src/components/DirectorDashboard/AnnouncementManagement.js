// src/components/DirectorDashboard/AnnouncementManagement.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  MenuItem,
  InputAdornment,
  Pagination,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/announcements");
      setAnnouncements(res.data);
      setFilteredAnnouncements(res.data);
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    } finally {
      setLoading(false);
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

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterAnnouncements(term, filterStatus);
  };

  const handleFilterChange = (e) => {
    const status = e.target.value;
    setFilterStatus(status);
    filterAnnouncements(searchTerm, status);
  };

  const filterAnnouncements = (term, status) => {
    let filtered = announcements.filter((a) => {
      const title = a.title?.toLowerCase() || "";
      const description = a.description?.toLowerCase() || "";
      return title.includes(term) || description.includes(term);
    });

    if (status !== "ALL") {
      filtered = filtered.filter((a) => a.status === status);
    }

    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
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

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnnouncements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Counters
  const publishedCount = announcements.filter(
    (a) => a.status === "PUBLISHED"
  ).length;
  const draftCount = announcements.filter((a) => a.status === "DRAFT").length;
  const archivedCount = announcements.filter(
    (a) => a.status === "ARCHIVED"
  ).length;

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold" color="#4B49AC">
          Announcement Overview
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Chip label={`Published: ${publishedCount}`} color="success" />
          <Chip label={`Drafts: ${draftCount}`} color="warning" />
          <Chip label={`Archived: ${archivedCount}`} color="default" />
          <Button
            startIcon={
              loading ? (
                <CircularProgress size={18} sx={{ color: "#4B49AC" }} />
              ) : (
                <RefreshIcon />
              )
            }
            variant="outlined"
            onClick={fetchAnnouncements}
            sx={{
              borderColor: "#4B49AC",
              color: "#4B49AC",
              textTransform: "none",
            }}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Reload"}
          </Button>
        </Box>
      </Box>

      {/* Search + Filter */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          placeholder="Search announcements..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Filter by Status"
          value={filterStatus}
          onChange={handleFilterChange}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="DRAFT">Draft</MenuItem>
          <MenuItem value="PUBLISHED">Published</MenuItem>
          <MenuItem value="ARCHIVED">Archived</MenuItem>
        </TextField>
      </Box>

      {/* Announcements List */}
      <List>
        {currentItems.map((announcement) => (
          <ListItem
            key={announcement.id}
            button
            alignItems="flex-start"
            onClick={() => handleShowDetails(announcement.id)}
            secondaryAction={
              <Tooltip title="View Details">
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowDetails(announcement.id);
                  }}
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            }
          >
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography fontWeight={600}>{announcement.title}</Typography>
                  <Chip
                    label={announcement.status}
                    size="small"
                    color={getStatusColor(announcement.status)}
                  />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  Created At: {formatDateTime(announcement.createdAt)} •
                  Published At: {formatDateTime(announcement.publishedAt)}
                </Typography>
              }
            />
          </ListItem>
        ))}

        {currentItems.length === 0 && !loading && (
          <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
            No announcements found.
          </Typography>
        )}
      </List>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredAnnouncements.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Details Dialog */}
      {selectedAnnouncement && (
        <Dialog
          open={!!selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              backgroundColor: "#4B49AC",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Announcement Details
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" fontWeight={600}>
              Title: {selectedAnnouncement.title}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Description:
            </Typography>
            <Typography paragraph>{selectedAnnouncement.description}</Typography>
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
