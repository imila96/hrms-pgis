import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Delete, Done, Close } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";

const EmployeeRecords = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    empId: null,
    empName: "",
  });

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");

  // Stabilize the fetch function with useCallback so it has a stable identity.
  // This allows us to include it safely in the useEffect dependency array
  // (avoiding eslint-disable comments) and also reuse the same function
  // from other handlers like handleSave/handleDelete without recreating it
  // on every render.
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/hr/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      showSnackbar("Failed to load employees", "error");
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // fetch profile change requests (placeholder endpoint)
  const [requests, setRequests] = useState([]);
  const fetchRequests = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/hr/profile-change-requests");
      setRequests(res.data);
    } catch (err) {
      // if endpoint not available yet, silently keep requests empty
      // console.error("Error fetching requests:", err);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // navigation handlers for add/edit (use route-based form)
  const handleAdd = () => navigate("/hr/records/newEmployee");
  const handleEdit = (emp) => navigate(`/hr/records/edit/${emp.id}`);

  const openDeleteConfirm = (id, name) => {
    setConfirmDialog({ open: true, empId: id, empName: name });
  };

  const handleDeleteConfirmed = async () => {
    const { empId } = confirmDialog;
    try {
      await axiosInstance.delete(`/hr/employees/${empId}`);
      showSnackbar("Employee deleted successfully", "success");
      fetchEmployees();
    } catch (error) {
      console.error("Error deleting employee:", error);
      showSnackbar("Failed to delete employee", "error");
    } finally {
      setConfirmDialog({ open: false, empId: null, empName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDialog({ open: false, empId: null, empName: "" });
  };

  // Handlers for profile change requests (approve / reject)
  const handleApproveRequest = async (id) => {
    // For now just remove from local list and show snackbar; later call backend
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showSnackbar("Request approved", "success");
  };

  const handleRejectRequest = async (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
    showSnackbar("Request rejected", "info");
  };

  // Overview values (total from table for now; other values are placeholders)
  const totalEmployees = employees.length;
  const activeEmployees = 200; // dummy for now
  const pendingRequests = 100; // placeholder

  // derive unique job titles for the filter dropdown
  const uniqueJobTitles = useMemo(() => {
    const s = new Set();
    employees.forEach((e) => {
      if (e.jobTitle) s.add(e.jobTitle);
    });
    return Array.from(s).sort();
  }, [employees]);

  // filtered view based on search and job title filter
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      if (filterJobTitle && emp.jobTitle !== filterJobTitle) return false;
      if (!q) return true;
      return (
        (emp.name || "").toLowerCase().includes(q) ||
        (emp.email || "").toLowerCase().includes(q) ||
        (emp.jobTitle || "").toLowerCase().includes(q)
      );
    });
  }, [employees, searchQuery, filterJobTitle]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Employee Record Management
      </Typography>

      {/* Overview cards (Total / Active / Pending) */}
      <Grid container spacing={2} alignItems="stretch" sx={{ mb: 2 }}>
        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              transition: "0.2s",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              minHeight: 120,
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total Employees
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#4B49AC">
              {totalEmployees}
            </Typography>
            <Typography variant="body2">Count from current table</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              transition: "0.2s",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              minHeight: 120,
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Active Employees
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#4B49AC">
              {activeEmployees}
            </Typography>
            <Typography variant="body2">Dummy value for now</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              transition: "0.2s",
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              minHeight: 120,
              justifyContent: "center",
              flex: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Pending Requests
            </Typography>
            <Typography variant="h5" fontWeight={700} color="#4B49AC">
              {pendingRequests}
            </Typography>
            <Typography variant="body2">
              Placeholder for pending items
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1, mt: 1 }}>
        Employee Table
      </Typography>

      <Button variant="contained" onClick={handleAdd} sx={{ mb: 2 }}>
        Add New Employee
      </Button>

      {/* Search and Filter controls */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Search by name, email or position"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            size="small"
          />
        </Grid>

        <Grid item xs={8} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel id="job-filter-label">Filter by Position</InputLabel>
            <Select
              labelId="job-filter-label"
              label="Filter by Position"
              value={filterJobTitle}
              onChange={(e) => setFilterJobTitle(e.target.value)}
            >
              <MenuItem value="">All Positions</MenuItem>
              {uniqueJobTitles.map((jt) => (
                <MenuItem key={jt} value={jt}>
                  {jt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={4} md={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchQuery("");
              setFilterJobTitle("");
            }}
            sx={{ width: "100%" }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ overflowX: "auto", maxHeight: 420, overflowY: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "#fff",
            }}
          >
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Contact</strong>
              </TableCell>
              <TableCell>
                <strong>Position</strong>
              </TableCell>
              <TableCell>
                <strong>Hire Date</strong>
              </TableCell>
              <TableCell>
                <strong>Address</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No employee records.
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.contact}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>{emp.hireDate}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {emp.address}
                  </TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(emp)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => openDeleteConfirm(emp.id, emp.name)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>
        Employee profile change request
      </Typography>

      <Paper
        sx={{ overflowX: "auto", maxHeight: 300, overflowY: "auto", mt: 2 }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "#fff",
            }}
          >
            <TableRow>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Contact</strong>
              </TableCell>
              <TableCell>
                <strong>Position</strong>
              </TableCell>
              <TableCell>
                <strong>Hire Date</strong>
              </TableCell>
              <TableCell>
                <strong>Address</strong>
              </TableCell>
              <TableCell>
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No profile change requests.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell>{req.name}</TableCell>
                  <TableCell>{req.email}</TableCell>
                  <TableCell>{req.contact}</TableCell>
                  <TableCell>{req.jobTitle}</TableCell>
                  <TableCell>{req.hireDate}</TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 200,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {req.address}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      color="success"
                      onClick={() => handleApproveRequest(req.id)}
                    >
                      <Done />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleRejectRequest(req.id)}
                    >
                      <Close />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Add/Edit dialog removed — using route-based CreateEditProfile page */}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={handleDeleteCancel}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{confirmDialog.empName}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteConfirmed}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployeeRecords;
