// src/components/EmployeeDashboard/Announcements.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  Chip,
  InputAdornment,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetails, setShowDetails] = useState(false);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get("/announcements/public");
      setAnnouncements(res.data);
      setFilteredAnnouncements(res.data);
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
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
    setSelectedAnnouncement(null);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    filterAnnouncements(term);
  };

  const filterAnnouncements = (term) => {
    let filtered = announcements.filter((a) => {
      const title = a.title ? a.title.toLowerCase() : "";
      const description = a.description ? a.description.toLowerCase() : "";
      return title.includes(term) || description.includes(term);
    });

    setFilteredAnnouncements(filtered);
    setCurrentPage(1);
  };

  const formatDateTime = (dateTime) => {
    return dateTime ? new Date(dateTime).toLocaleString() : "N/A";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "warning";
      case "PUBLISHED":
        return "success";
      case "ARCHIVED":
        return "default";
      default:
        return "default";
    }
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

  return (
    <Box>
      <BackButton />
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" fontWeight="bold">
            Company Announcements
          </Typography>

          <Chip label={`Total: ${announcements.length}`} color="primary" />
        </Box>

        {/* Search and Filter */}
        <Box display="flex" gap={2} mb={3}>
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
        </Box>

        {/* Table View */}
        <TableContainer component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Published At</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.title}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.status}
                        color={getStatusColor(a.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDateTime(a.publishedAt)}</TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleShowDetails(a.id)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No announcements found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

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
        <Dialog
          open={showDetails}
          onClose={handleCloseDetails}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Announcement Details</DialogTitle>
          <DialogContent dividers>
            {selectedAnnouncement && (
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {selectedAnnouncement.title}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Description:</strong> {selectedAnnouncement.description}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Status:</strong>{" "}
                  <Chip
                    label={selectedAnnouncement.status}
                    color={getStatusColor(selectedAnnouncement.status)}
                    size="small"
                  />
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Published At:</strong>{" "}
                  {formatDateTime(selectedAnnouncement.publishedAt)}
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Created At:</strong>{" "}
                  {formatDateTime(selectedAnnouncement.createdAt)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default AnnouncementManagement;
