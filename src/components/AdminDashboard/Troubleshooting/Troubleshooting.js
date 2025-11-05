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
  const [statusFilter, setStatusFilter] = useState("All");

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
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Resolved" && issue.resolved) ||
      (statusFilter === "Pending" && !issue.resolved);

    return matchesSearch && matchesStatus;
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

      {/* 🔍 Search, Filter & Counts in One Row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Left side: Search & Filter */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ flexGrow: 1 }}
        >
          <TextField
            label="Search by date or description"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            sx={{ width: { xs: "100%", sm: "50%" } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ width: { xs: "100%", sm: "25%" } }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Right side: Status counts */}
        <Stack direction="row" spacing={1}>
          <Chip
            label={`Pending: ${issues.filter((i) => !i.resolved).length}`}
            color="warning"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`Resolved: ${issues.filter((i) => i.resolved).length}`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`Total: ${issues.length}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Stack>
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
