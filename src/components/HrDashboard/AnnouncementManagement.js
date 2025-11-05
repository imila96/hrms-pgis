// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Tooltip,
//   Chip,
// } from "@mui/material";
// import {
//   Edit as EditIcon,
//   Add as AddIcon,
//   Publish as PublishIcon,
//   Visibility as VisibilityIcon,
// } from "@mui/icons-material";
// import axiosInstance from "../../AxiosInstance";

// const AnnouncementManagement = () => {
//   const [announcements, setAnnouncements] = useState([]);
//   const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//   });

//   useEffect(() => {
//     fetchAnnouncements();
//   }, []);

//   const fetchAnnouncements = async () => {
//     try {
//       const res = await axiosInstance.get(
//         "http://localhost:8080/announcements"
//       );
//       setAnnouncements(res.data);
//     } catch (err) {
//       console.error("Failed to fetch announcements", err);
//     }
//   };

//   const fetchAnnouncementDetails = async (id) => {
//     try {
//       const res = await axiosInstance.get(`/announcements/${id}`);
//       return res.data;
//     } catch (err) {
//       console.error("Failed to fetch announcement details", err);
//       return null;
//     }
//   };

//   const handleDialogOpen = async (id = null) => {
//     if (id) {
//       const detail = await fetchAnnouncementDetails(id);
//       if (detail) {
//         setEditingId(id);
//         setFormData({
//           title: detail.title,
//           description: detail.description,
//         });
//       }
//     } else {
//       setEditingId(null);
//       setFormData({ title: "", description: "" });
//     }
//     setDialogOpen(true);
//   };

//   const handleDialogClose = () => {
//     setDialogOpen(false);
//     setEditingId(null);
//     setFormData({ title: "", description: "" });
//   };

//   const handleSave = async () => {
//     if (!formData.title || !formData.description) {
//       alert("Title and Description are required.");
//       return;
//     }

//     try {
//       if (editingId) {
//         await axiosInstance.put(`/announcements/${editingId}`, formData);
//       } else {
//         await axiosInstance.post("/announcements", formData);
//       }
//       fetchAnnouncements();
//       handleDialogClose();
//     } catch (err) {
//       console.error("Failed to save announcement", err);
//     }
//   };

//   const handlePublish = async (id) => {
//     if (!window.confirm("Are you sure you want to publish this announcement?"))
//       return;
//     try {
//       await axiosInstance.patch(`/announcements/${id}/publish`);
//       fetchAnnouncements();
//     } catch (err) {
//       console.error("Failed to publish announcement", err);
//     }
//   };

//   const handleShowDetails = async (id) => {
//     const detail = await fetchAnnouncementDetails(id);
//     setSelectedAnnouncement(detail);
//   };

//   const formatDateTime = (dateTime) => {
//     return dateTime ? new Date(dateTime).toLocaleString() : "N/A";
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "DRAFT":
//         return "default";
//       case "PUBLISHED":
//         return "success";
//       case "ARCHIVED":
//         return "warning";
//       default:
//         return "default";
//     }
//   };

//   return (
//     <Paper sx={{ p: 3 }}>
//       <Box
//         display="flex"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={2}
//       >
//         <Typography variant="h5">Announcement Management</Typography>
//         <Button
//           variant="contained"
//           startIcon={<AddIcon />}
//           onClick={() => handleDialogOpen()}
//         >
//           Add Announcement
//         </Button>
//       </Box>

//       <List>
//         {announcements.map((announcement) => (
//           <ListItem
//             key={announcement.id}
//             button
//             alignItems="flex-start"
//             onClick={() => handleShowDetails(announcement.id)}
//             secondaryAction={
//               <Box display="flex" alignItems="center" gap={1}>
//                 <Tooltip title="Edit">
//                   <IconButton
//                     color="primary"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleDialogOpen(announcement.id);
//                     }}
//                   >
//                     <EditIcon />
//                   </IconButton>
//                 </Tooltip>
//                 {announcement.status === "DRAFT" && (
//                   <Tooltip title="Publish">
//                     <IconButton
//                       color="success"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handlePublish(announcement.id);
//                       }}
//                     >
//                       <PublishIcon />
//                     </IconButton>
//                   </Tooltip>
//                 )}
//               </Box>
//             }
//           >
//             <ListItemText
//               primary={
//                 <Box display="flex" alignItems="center" gap={1}>
//                   {announcement.title}
//                   <Chip
//                     label={announcement.status}
//                     size="small"
//                     color={getStatusColor(announcement.status)}
//                   />
//                 </Box>
//               }
//               secondary={`Published At: ${formatDateTime(
//                 announcement.publishedAt
//               )}`}
//             />
//           </ListItem>
//         ))}
//       </List>

//       {/* Add/Edit Dialog */}
//       <Dialog open={dialogOpen} onClose={handleDialogClose}>
//         <DialogTitle>
//           {editingId ? "Edit Announcement" : "Add New Announcement"}
//         </DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Title"
//             fullWidth
//             margin="dense"
//             value={formData.title}
//             onChange={(e) =>
//               setFormData({ ...formData, title: e.target.value })
//             }
//           />
//           <TextField
//             label="Description"
//             fullWidth
//             margin="dense"
//             multiline
//             rows={4}
//             value={formData.description}
//             onChange={(e) =>
//               setFormData({ ...formData, description: e.target.value })
//             }
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDialogClose}>Cancel</Button>
//           <Button variant="contained" onClick={handleSave}>
//             {editingId ? "Update" : "Add"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Detail Dialog */}
//       {selectedAnnouncement && (
//         <Dialog
//           open={!!selectedAnnouncement}
//           onClose={() => setSelectedAnnouncement(null)}
//         >
//           <DialogTitle>Announcement Details</DialogTitle>
//           <DialogContent dividers>
//             <Typography variant="subtitle1">
//               <strong>Title:</strong> {selectedAnnouncement.title}
//             </Typography>
//             <Typography variant="subtitle1">
//               <strong>Description:</strong>
//             </Typography>
//             <Typography paragraph>
//               {selectedAnnouncement.description}
//             </Typography>
//             <Typography>
//               <strong>Status:</strong> {selectedAnnouncement.status}
//             </Typography>
//             <Typography>
//               <strong>Created At:</strong>{" "}
//               {formatDateTime(selectedAnnouncement.createdAt)}
//             </Typography>
//             <Typography>
//               <strong>Created By:</strong> {selectedAnnouncement.createdBy}
//             </Typography>
//             <Typography>
//               <strong>Published At:</strong>{" "}
//               {formatDateTime(selectedAnnouncement.publishedAt)}
//             </Typography>
//             <Typography>
//               <strong>Published By:</strong>{" "}
//               {selectedAnnouncement.publishedBy || "N/A"}
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setSelectedAnnouncement(null)}>Close</Button>
//           </DialogActions>
//         </Dialog>
//       )}
//     </Paper>
//   );
// };

// export default AnnouncementManagement;
// including search/ filter and pagination

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
  MenuItem,
  InputAdornment,
  Pagination,
} from "@mui/material";

import {
  Edit as EditIcon,
  Add as AddIcon,
  Publish as PublishIcon,
  Visibility as VisibilityIcon,
  Search as SearchIcon,
} from "@mui/icons-material";

import axiosInstance from "../../AxiosInstance";

const AnnouncementManagement = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filteredAnnouncements, setFilteredAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // number of announcements to show per page

  useEffect(() => {
    // when react component is mounting ( when we coming to announcements from anywhere )
    // then get those announcemnets only one time
    fetchAnnouncements(); // frontend backend intergration
  }, []);

  // here we are using try and catch --> some errors will occur ( it will happen through netwrok - errors -- connection errors)
  const fetchAnnouncements = async () => {
    try {
      const res = await axiosInstance.get("/announcements"); //  use get request
      setAnnouncements(res.data);
      setFilteredAnnouncements(res.data); // new state to handle filtering
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    }
  };

  const fetchAnnouncementDetails = async (id) => {
    // we can get details of only one announcement
    try {
      const res = await axiosInstance.get(`/announcements/${id}`); // need to give specific id of that announcement
      // use axios libarary work with backend
      // normally we use axios.get but here we use axiosInstance ( we created component - it includes JWT token ) - beacuse here we use data authorization and authontication , data tokens )
      // so noramlly it is not work for axios.get , so we need to send with token like axiosInstance
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
    // No dialogOpen state needed anymore
  };

  const handleDialogClose = () => {
    setEditingId(null);
    setFormData({ title: "", description: "" });
  };

  const handleSave = async () => {
    // when saving( add ) after adding new announcement
    if (!formData.title || !formData.description) {
      // when adding new announcement --> title and description are empty
      alert("Title and Description are required.");
      return;
    }

    try {
      if (editingId) {
        // create  new announcement then editing id will be false
        await axiosInstance.put(`/announcements/${editingId}`, formData); // if editing id is true --> edit send put
      } else {
        await axiosInstance.post("/announcements", formData); // if editing id is false --> create new post
        // formData ( title and description )- announcement object
      }
      fetchAnnouncements(); // after updating or adding new announcements in backend , so we need to request all data to frontend
      handleDialogClose();
    } catch (err) {
      console.error("Failed to save announcement", err);
    }
  };

  const handlePublish = async (id) => {
    if (!window.confirm("Are you sure you want to publish this announcement?"))
      return;
    try {
      await axiosInstance.patch(`/announcements/${id}/publish`); // use patch because here we not do full editing , only one field
      // when we add announcements then that will show like drafts, then publish it ( patch )
      fetchAnnouncements(); // request new list
    } catch (err) {
      console.error("Failed to publish announcement", err);
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
      const title = a.title ? a.title.toLowerCase() : "";
      const description = a.description ? a.description.toLowerCase() : "";
      return title.includes(term) || description.includes(term);
    });

    if (status !== "ALL") {
      filtered = filtered.filter((a) => a.status === status);
    }

    setFilteredAnnouncements(filtered);
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

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnnouncements.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Calculate counts
  const publishedCount = announcements.filter(
    (a) => a.status === "PUBLISHED"
  ).length;
  const draftCount = announcements.filter((a) => a.status === "DRAFT").length;

  return (
    // all UI inside this return
    <Paper sx={{ p: 3 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5" fontWeight="bold">
          Announcement Management
        </Typography>

        <Box display="flex" gap={2}>
          <Chip label={`Published: ${publishedCount}`} color="success" />
          <Chip label={`Drafts: ${draftCount}`} color="warning" />
        </Box>
      </Box>

      {/* Search and Filter Controls */}
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

      <List>
        {currentItems.map((announcement) => (
          // announcement in backend bring and store in the announcement ( when cursorr on object - highlighting object)
          <ListItem
            key={announcement.id}
            button
            alignItems="flex-start"
            onClick={() => handleShowDetails(announcement.id)}
            secondaryAction={
              <Box display="flex" alignItems="center" gap={1}>
                {announcement.status !== "PUBLISHED" && (
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
                )}
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

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredAnnouncements.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Add / Edit Form View */}
      <Box
        mt={4}
        p={3}
        border="1px solid #ddd"
        borderRadius={2}
        boxShadow={1}
        bgcolor="#fafafa"
      >
        <Typography variant="h6" gutterBottom>
          {editingId ? "Edit Announcement" : "Add New Announcement"}
        </Typography>

        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

        <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
          {editingId && (
            <Button
              onClick={() => {
                handleDialogClose();
              }}
            >
              Cancel
            </Button>
          )}
          <Button variant="contained" color="primary" onClick={handleSave}>
            {editingId ? "Update Announcement" : "Add Announcement"}
          </Button>
        </Box>
      </Box>

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
