// import React, { useEffect, useState } from "react";
// import {
//   Box, Typography, List, ListItem, ListItemText, IconButton,
//   Chip, Stack, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, Tooltip
// } from "@mui/material";
// import DoneIcon from "@mui/icons-material/Done";
// import axiosInstance from "../../../AxiosInstance";

// const chip = (s) => (
//   <Chip label={s === "RESOLVED" ? "Resolved" : "Pending"} size="small"
//         color={s === "RESOLVED" ? "success" : "warning"} />
// );

// export default function Troubleshooting() {
//   const [issues, setIssues] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("ALL");
//   const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

//   const load = async () => {
//     try {
//       const params = statusFilter === "ALL" ? {} : { status: statusFilter };
//       const { data } = await axiosInstance.get("/issues", { params });
//       setIssues(data || []);
//     } catch (e) {
//       setSnack({ open: true, msg: `Load failed: ${e.response?.status || e.message}`, sev: "error" });
//     }
//   };

//   useEffect(() => { load(); }, [statusFilter]);

//   const resolveOne = async (id) => {
//     try {
//       await axiosInstance.patch(`/issues/${id}/resolve`);
//       setSnack({ open: true, msg: "Marked as resolved.", sev: "success" });
//       await load();
//     } catch (e) {
//       setSnack({ open: true, msg: `Update failed: ${e.response?.status || e.message}`, sev: "error" });
//     }
//   };

//   return (
//     <Box>
//       <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
//         <Typography variant="h5">Troubleshooting & Reported Issues</Typography>
//         <FormControl size="small" sx={{ minWidth: 160 }}>
//           <InputLabel id="admin-issue-filter">Status</InputLabel>
//           <Select labelId="admin-issue-filter" label="Status" value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}>
//             <MenuItem value="ALL">All</MenuItem>
//             <MenuItem value="PENDING">Pending</MenuItem>
//             <MenuItem value="RESOLVED">Resolved</MenuItem>
//           </Select>
//         </FormControl>
//       </Stack>

//       <List>
//         {issues.map((it) => (
//           <ListItem key={it.id} divider sx={{ background: it.status === "RESOLVED" ? "#eaf7ea" : "#fff8e6", mb: 1, borderRadius: 1 }}>
//             <ListItemText
//               primary={<Stack direction="row" spacing={1} alignItems="center">
//                 <Typography fontWeight={600}>{it.title}</Typography>{chip(it.status)}
//               </Stack>}
//               secondary={it.description}
//             />
//             {it.status === "PENDING" && (
//               <Tooltip title="Mark resolved">
//                 <IconButton onClick={() => resolveOne(it.id)}><DoneIcon /></IconButton>
//               </Tooltip>
//             )}
//           </ListItem>
//         ))}
//         {issues.length === 0 && <Typography color="text.secondary" sx={{ mt: 2 }}>No issues.</Typography>}
//       </List>

//       <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
//         <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} sx={{ width: "100%" }}>
//           {snack.msg}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }
// including search/filter and pagination

import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Pagination,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import SearchIcon from "@mui/icons-material/Search";

const Troubleshooting = () => {
  const [issues, setIssues] = useState([
    {
      id: 1,
      description: "Login page throws 500 error occasionally.",
      submittedAt: "2025-07-25 10:20 AM",
      level: "Critical",
      resolved: false,
    },
    {
      id: 2,
      description: "Password reset email not sent.",
      submittedAt: "2025-07-26 02:45 PM",
      level: "Warning",
      resolved: false,
    },
    {
      id: 3,
      description: "User profile picture upload fails.",
      submittedAt: "2025-07-27 09:15 AM",
      level: "Info",
      resolved: true,
    },

    {
      id: 4,
      description: "Server response delay on dashboard.",
      submittedAt: "2025-07-28 11:30 AM",
      level: "Warning",
      resolved: false,
    },

    {
      id: 5,
      description: "Notifications not appearing for new messages.",
      submittedAt: "2025-07-29 09:50 AM",
      level: "Info",
      resolved: false,
    },

    {
      id: 6,
      description: "Server response delay on dashboard.",
      submittedAt: "2025-07-28 11:30 AM",
      level: "Warning",
      resolved: false,
    },

    {
      id: 7,
      description: "Notifications not appearing for new messages.",
      submittedAt: "2025-07-29 09:50 AM",
      level: "Info",
      resolved: false,
    },
  ]);

  // --- States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("All");

  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const markResolved = (id) => {
    const updated = issues.map((issue) =>
      issue.id === id ? { ...issue, resolved: true } : issue
    );
    setIssues(updated);
  };

  // Add this **after filtering** inside the component
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.submittedAt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "All" || issue.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Pagination logic
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedIssues = filteredIssues.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

  // --- Count summaries ---
  const totalAll = issues.length;
  const totalCritical = issues.filter((i) => i.level === "Critical").length;
  const totalWarning = issues.filter((i) => i.level === "Warning").length;
  const totalInfo = issues.filter((i) => i.level === "Info").length;

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Troubleshooting & Reported Issues
      </Typography>

      {/* 📊 Summary Counters */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <Box
          sx={{
            p: 2,
            flex: 1,
            bgcolor: "#e3f2fd",
            borderRadius: 2,
            textAlign: "center",
            boxShadow: 1,
          }}
        >
          <Typography variant="h6">{totalAll}</Typography>
          <Typography variant="body2">All Issues</Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            flex: 1,
            bgcolor: "#ffebee",
            borderRadius: 2,
            textAlign: "center",
            boxShadow: 1,
          }}
        >
          <Typography variant="h6">{totalCritical}</Typography>
          <Typography variant="body2">Critical</Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            flex: 1,
            bgcolor: "#fff8e1",
            borderRadius: 2,
            textAlign: "center",
            boxShadow: 1,
          }}
        >
          <Typography variant="h6">{totalWarning}</Typography>
          <Typography variant="body2">Warning</Typography>
        </Box>
        <Box
          sx={{
            p: 2,
            flex: 1,
            bgcolor: "#e0f7fa",
            borderRadius: 2,
            textAlign: "center",
            boxShadow: 1,
          }}
        >
          <Typography variant="h6">{totalInfo}</Typography>
          <Typography variant="body2">Info</Typography>
        </Box>
      </Stack>

      {/* 🔍 Search & Filter Controls */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
        <TextField
          label="Search by date or description"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1); // reset pagination
          }}
          sx={{ width: { xs: "100%", sm: "40%" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ width: { xs: "100%", sm: "25%" } }}>
          <InputLabel>Filter by Level</InputLabel>
          <Select
            value={levelFilter}
            label="Filter by Level"
            onChange={(e) => {
              setLevelFilter(e.target.value);
              setPage(1); // reset pagination
            }}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Critical">Critical</MenuItem>
            <MenuItem value="Warning">Warning</MenuItem>
            <MenuItem value="Info">Info</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <List>
        {paginatedIssues.map((issue) => (
          <ListItem
            key={issue.id}
            secondaryAction={
              !issue.resolved && (
                <IconButton edge="end" onClick={() => markResolved(issue.id)}>
                  <DoneIcon />
                </IconButton>
              )
            }
            sx={{
              backgroundColor: issue.resolved ? "#e0f7e9" : "#fff3e0",
              mb: 1,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <ListItemText
              primary={
                <>
                  {issue.description}
                  <Chip
                    label={issue.level}
                    color={
                      issue.level === "Critical"
                        ? "error"
                        : issue.level === "Warning"
                        ? "warning"
                        : "info"
                    }
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </>
              }
              secondary={
                <Stack direction="row" spacing={2}>
                  <Typography variant="caption">
                    Submitted at: {issue.submittedAt}
                  </Typography>
                  <Chip
                    label={issue.resolved ? "Resolved" : "Pending"}
                    color={issue.resolved ? "success" : "warning"}
                    size="small"
                  />
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
      <Box display="flex" justifyContent="center" mt={2}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, value) => setPage(value)}
          color="primary"
          shape="rounded"
        />
      </Box>
    </Box>
  );
};

export default Troubleshooting;
