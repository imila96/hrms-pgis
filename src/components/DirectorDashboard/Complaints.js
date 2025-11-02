// // src/components/EmployeeDashboard/Complaints.js
// import React, { useState } from "react";
// import {
//   Paper,
//   Typography,
//   List,
//   ListItem,
//   ListItemText,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   TextField,
//   DialogActions,
//   Snackbar,
//   Alert,
// } from "@mui/material";

// const Complaints = () => {
//   const [complaints, setComplaints] = useState([
//     { id: 1, title: "Computer not working", description: "My computer frequently crashes.", status: "Open" },
//     { id: 2, title: "Network issue", description: "Wi-Fi is slow in my area.", status: "Resolved" },
//   ]);

//   const [open, setOpen] = useState(false);
//   const [newComplaint, setNewComplaint] = useState({ title: "", description: "" });
//   const [alertOpen, setAlertOpen] = useState(false);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   const handleChange = (e) => {
//     setNewComplaint({ ...newComplaint, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = () => {
//     if (newComplaint.title && newComplaint.description) {
//       setComplaints([...complaints, { id: complaints.length + 1, ...newComplaint, status: "Open" }]);
//       setNewComplaint({ title: "", description: "" });
//       setOpen(false);
//       setAlertOpen(true);
//     }
//   };

//   return (
//     <Paper sx={{ p: 3, maxWidth: 800 }}>
//       <Typography variant="h6" gutterBottom>
//         Complaints / Technical Issues
//       </Typography>
//       <Button variant="contained" color="primary" onClick={handleOpen} sx={{ mb: 2 }}>
//         Submit New Complaint
//       </Button>

//       <List>
//         {complaints.map(({ id, title, description, status }) => (
//           <ListItem key={id} divider>
//             <ListItemText
//               primary={`${title} (${status})`}
//               secondary={description}
//             />
//           </ListItem>
//         ))}
//       </List>

//       {/* Complaint Submission Dialog */}
//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Submit Complaint</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Title"
//             name="title"
//             value={newComplaint.title}
//             onChange={handleChange}
//             fullWidth
//             margin="normal"
//           />
//           <TextField
//             label="Description"
//             name="description"
//             value={newComplaint.description}
//             onChange={handleChange}
//             fullWidth
//             multiline
//             rows={4}
//             margin="normal"
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose}>Cancel</Button>
//           <Button
//             onClick={handleSubmit}
//             variant="contained"
//             disabled={!newComplaint.title || !newComplaint.description}
//           >
//             Submit
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Success Snackbar */}
//       <Snackbar open={alertOpen} autoHideDuration={4000} onClose={() => setAlertOpen(false)}>
//         <Alert onClose={() => setAlertOpen(false)} severity="success" sx={{ width: "100%" }}>
//           Complaint submitted successfully!
//         </Alert>
//       </Snackbar>
//     </Paper>
//   );
// };

// export default Complaints;
// src/components/EmployeeDashboard/Complaints.js
import React, { useState, useMemo } from "react";
import {
  Paper,
  Typography,
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
  Box,
  TextField,
  MenuItem,
} from "@mui/material";

export default function Complaints() {
  const [complaints] = useState([
    {
      id: 1,
      title: "Computer not working",
      description: "My computer frequently crashes.",
      status: "Open",
      createdAt: "2025-10-01T09:20:00",
    },
    {
      id: 2,
      title: "Network issue",
      description: "Wi-Fi is slow in my area.",
      status: "Resolved",
      createdAt: "2025-09-25T15:45:00",
    },
    {
      id: 3,
      title: "Printer not responding",
      description: "Office printer shows an error code.",
      status: "Pending",
      createdAt: "2025-10-05T11:10:00",
    },
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // === Helper Functions ===
  const handleShowDetails = (complaint) => setSelectedComplaint(complaint);
  const handleCloseDetails = () => setSelectedComplaint(null);

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "warning";
      case "Resolved":
        return "success";
      case "Pending":
        return "info";
      default:
        return "default";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // === Filter & Search Logic ===
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchStatus = statusFilter ? c.status === statusFilter : true;
      const matchText =
        c.title.toLowerCase().includes(searchText.toLowerCase()) ||
        c.description.toLowerCase().includes(searchText.toLowerCase());
      return matchStatus && matchText;
    });
  }, [complaints, searchText, statusFilter]);

  return (
    <Paper sx={{ p: 3, maxWidth: 850, backgroundColor: "#f6f7fb" }}>
      {/* ===== Header ===== */}
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: "#4B49AC", fontWeight: 700 }}
      >
        Complaints / Technical Issues
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        View and filter your submitted complaints with their current status.
      </Typography>

      {/* ===== Filter & Search Bar ===== */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextField
          label="Search (title / description)"
          variant="outlined"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          sx={{ minWidth: 250, flexGrow: 1 }}
        />

        <TextField
          label="Filter by Status"
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="Open">Open</MenuItem>
          <MenuItem value="Pending">Pending</MenuItem>
          <MenuItem value="Resolved">Resolved</MenuItem>
        </TextField>
      </Box>

      {/* ===== Complaints List ===== */}
      <List>
        {filteredComplaints.length === 0 ? (
          <Typography
            sx={{ p: 2, textAlign: "center", color: "text.secondary" }}
          >
            No complaints match your filters
          </Typography>
        ) : (
          filteredComplaints.map((c) => (
            <React.Fragment key={c.id}>
              <ListItem
                button
                alignItems="flex-start"
                onClick={() => handleShowDetails(c)}
              >
                <ListItemText
                  primary={
                    <Typography fontWeight={600}>
                      {c.title}{" "}
                      <Chip
                        label={c.status}
                        color={getStatusColor(c.status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ mb: 0.5 }}
                      >
                        {c.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Reported on: {formatDate(c.createdAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))
        )}
      </List>

      {/* ===== Complaint Detail Dialog ===== */}
      {selectedComplaint && (
        <Dialog
          open={!!selectedComplaint}
          onClose={handleCloseDetails}
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
            Complaint Details
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" fontWeight={600}>
              Title: {selectedComplaint.title}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Description:</strong>
            </Typography>
            <Typography paragraph>{selectedComplaint.description}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>
              <strong>Status:</strong>{" "}
              <Chip
                label={selectedComplaint.status}
                color={getStatusColor(selectedComplaint.status)}
                size="small"
                sx={{ ml: 1 }}
              />
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Reported on:</strong>{" "}
              {formatDate(selectedComplaint.createdAt)}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Paper>
  );
}
