import React, { useState, useEffect } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import SearchIcon from "@mui/icons-material/Search";
import axiosInstance from "../../../AxiosInstance";

const Troubleshooting = () => {
  const [issues, setIssues] = useState([]);
  const [, setLoading] = useState(true);

  // --- States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [resolveDialog, setResolveDialog] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const itemsPerPage = 5;

  // Fetch technical issues from backend
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/issues/technical");
        if (Array.isArray(res.data)) {
          setIssues(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch technical issues:", e);
        alert("Failed to load technical issues. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const markResolved = (issue) => {
    setSelected(issue);
    setRemarkText("");
    setResolveDialog(true);
  };

  const handleResolve = async () => {
    if (!selected || !remarkText.trim()) {
      alert("Please provide a remark to resolve the issue.");
      return;
    }

    try {
      const res = await axiosInstance.patch(`/issues/${selected.id}/resolve`, {
        remark: remarkText.trim()
      });
      
      // Update local state
      setIssues((prev) =>
        prev.map((issue) => (issue.id === selected.id ? res.data : issue))
      );
      
      setResolveDialog(false);
      setSelected(null);
      setRemarkText("");
    } catch (e) {
      console.error("Failed to resolve issue:", e);
      alert("Failed to resolve issue. Please try again.");
    }
  };

  // Add this **after filtering** inside the component
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.submittedBy?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Resolved" && issue.status === "RESOLVED") ||
      (statusFilter === "Pending" && issue.status === "PENDING");

    return matchesSearch && matchesStatus;
  });

  const startIndex = (page - 1) * itemsPerPage;
  const paginatedIssues = filteredIssues.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(filteredIssues.length / itemsPerPage);

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
            label={`Pending: ${issues.filter((i) => i.status === "PENDING").length}`}
            color="warning"
            variant="outlined"
            size="small"
          />
          <Chip
            label={`Resolved: ${issues.filter((i) => i.status === "RESOLVED").length}`}
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
              issue.status !== "RESOLVED" && (
                <IconButton edge="end" onClick={() => markResolved(issue)}>
                  <DoneIcon />
                </IconButton>
              )
            }
            sx={{
              backgroundColor: issue.status === "RESOLVED" ? "#e0f7e9" : "#fff3e0",
              mb: 1,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <ListItemText
              primary={
                <>
                  <Typography variant="body1" fontWeight={600}>
                    {issue.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {issue.description}
                  </Typography>
                </>
              }
              secondary={
                <Stack direction="row" spacing={2} mt={1}>
                  <Typography variant="caption">
                    Submitted by: {issue.submittedBy || "N/A"}
                  </Typography>
                  <Typography variant="caption">
                    At: {issue.createdAt ? new Date(issue.createdAt).toLocaleString() : "N/A"}
                  </Typography>
                  <Chip
                    label={issue.status === "RESOLVED" ? "Resolved" : "Pending"}
                    color={issue.status === "RESOLVED" ? "success" : "warning"}
                    size="small"
                  />
                  {issue.updatedBy && (
                    <Typography variant="caption" color="success.main">
                      Resolved by: {issue.updatedBy}
                    </Typography>
                  )}
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

      {/* Resolve Dialog */}
      <Dialog 
        open={resolveDialog} 
        onClose={() => setResolveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Resolve Technical Issue</DialogTitle>
        <DialogContent dividers>
          {selected && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Issue:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, borderRadius: 1 }}>
                <Typography variant="body1" fontWeight={600}>
                  {selected.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.description}
                </Typography>
                <Typography variant="caption" display="block" mt={1}>
                  Submitted by: {selected.submittedBy} on{" "}
                  {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "N/A"}
                </Typography>
              </Paper>

              <TextField
                label="Resolution Remark"
                fullWidth
                multiline
                rows={4}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResolveDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleResolve}
            disabled={!remarkText.trim()}
          >
            Mark as Resolved
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Troubleshooting;
