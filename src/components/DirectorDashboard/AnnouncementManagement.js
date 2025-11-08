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
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/announcements/public");
      const published = Array.isArray(res.data)
        ? res.data.filter((a) => a.status === "PUBLISHED")
        : [];
      setAnnouncements(published);
      setFilteredAnnouncements(published);
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
    const filtered = announcements.filter((a) => {
      const title = a.title?.toLowerCase() || "";
      const description = a.description?.toLowerCase() || "";
      return title.includes(term) || description.includes(term);
    });
    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  };

  const formatDateTime = (dateTime) => {
    return dateTime ? new Date(dateTime).toLocaleString() : "N/A";
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnnouncements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const publishedCount = announcements.length;

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
          Published Announcements
        </Typography>

        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={`Total Published: ${publishedCount}`}
            color="success"
            sx={{ fontWeight: 600 }}
          />
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

      {/* Search */}
      <Box display="flex" gap={2} mb={2}>
        <TextField
          fullWidth
          placeholder="Search published announcements..."
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
      </Box>

      {/* List */}
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
                  <Chip label="PUBLISHED" size="small" color="success" />
                </Box>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  Published At: {formatDateTime(announcement.publishedAt)} • By:{" "}
                  {announcement.publishedBy || "N/A"}
                </Typography>
              }
            />
          </ListItem>
        ))}

        {!loading && currentItems.length === 0 && (
          <Typography align="center" color="text.secondary" sx={{ mt: 2 }}>
            No published announcements found.
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
