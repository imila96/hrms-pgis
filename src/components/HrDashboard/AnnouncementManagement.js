import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Tooltip,
  Chip,
  MenuItem,
  InputAdornment,
  Pagination,
  Stack,
} from "@mui/material";

import {
  Edit as EditIcon,
  Publish as PublishIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
  Add as AddIcon,
} from "@mui/icons-material";

import axiosInstance from "../../AxiosInstance";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formRef = useRef(null);
  const detailsRef = useRef(null);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get("/announcements");
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

  const handleOpenForm = async (id = null) => {
    setShowDetails(false); // hide details if visible

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
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
  };

  const handleCloseForm = () => {
    setEditingId(null);
    setFormData({ title: "", description: "" });
    setShowForm(false);
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
      handleCloseForm();
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
    setShowForm(false); // hide form if visible
    const detail = await fetchAnnouncementDetails(id);
    setSelectedAnnouncement(detail);
    setShowDetails(true);

    setTimeout(() => {
      detailsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
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
      const title = a.title ? a.title.toLowerCase() : "";
      const description = a.description ? a.description.toLowerCase() : "";
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

  const publishedCount = announcements.filter(
    (a) => a.status === "PUBLISHED"
  ).length;
  const draftCount = announcements.filter((a) => a.status === "DRAFT").length;

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Announcement Management
        </Typography>

        <Stack direction="row" spacing={2}>
          <Chip label={`Published: ${publishedCount}`} color="success" />
          <Chip label={`Drafts: ${draftCount}`} color="warning" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Announcement
          </Button>
        </Stack>
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

      {/* Table View (no description column) */}
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
                    <Tooltip title="View Details">
                      <IconButton
                        color="primary"
                        onClick={() => handleShowDetails(a.id)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {a.status !== "PUBLISHED" && (
                      <Tooltip title="Edit">
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenForm(a.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                    {a.status === "DRAFT" && (
                      <Tooltip title="Publish">
                        <IconButton
                          color="success"
                          onClick={() => handlePublish(a.id)}
                        >
                          <PublishIcon />
                        </IconButton>
                      </Tooltip>
                    )}
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

      {/* Inline Form Section */}
      {showForm && (
        <Box ref={formRef} mt={4} p={3} component={Paper} elevation={2}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            {editingId ? "Edit Announcement" : "Add New Announcement"}
          </Typography>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            margin="normal"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button onClick={handleCloseForm}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleSave}>
              {editingId ? "Update" : "Add"}
            </Button>
          </Stack>
        </Box>
      )}

      {/* Inline Details Section */}
      {showDetails && selectedAnnouncement && (
        <Box ref={detailsRef} mt={4} p={3} component={Paper} elevation={2}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Announcement Details
          </Typography>
          <Typography>
            <strong>Title:</strong> {selectedAnnouncement.title}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <strong>Description:</strong> {selectedAnnouncement.description}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <strong>Status:</strong> {selectedAnnouncement.status}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <strong>Published At:</strong>{" "}
            {formatDateTime(selectedAnnouncement.publishedAt)}
          </Typography>
          <Typography sx={{ mt: 1 }}>
            <strong>Created At:</strong>{" "}
            {formatDateTime(selectedAnnouncement.createdAt)}
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
            <Button onClick={() => setShowDetails(false)}>Close</Button>
          </Stack>
        </Box>
      )}
    </Paper>
  );
};

export default AnnouncementManagement;
