import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Grid,
  TableContainer,
  TablePagination,
  Stack,
  Chip,
} from "@mui/material";

import axiosInstance from "../../AxiosInstance";

// job status constants (frontend)
const [Closed, Open, Urgent, Accepted, Rejected] = [
  "Closed",
  "Open",
  "Urgent",
  "Accepted",
  "Rejected",
];

const RecruitmentManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    status: "",
  });
  const [editJobOpening, setEditJobOpening] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");

  // UI for job list
  const [jobTab, setJobTab] = useState(0); // 0: current, 1: upcoming, 2: history
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // filters
  const [filterDept, setFilterDept] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterLocation, setFilterLocation] = useState("All");

  const vacanciesSummary = React.useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((j) => j && j.status === Open).length;
    const urgent = jobs.filter((j) => j && j.urgent).length;
    // positions per department
    const map = new Map();
    jobs.forEach((j) => {
      const dept = j.department || "Unknown";
      const pos = j.positions ? Number(j.positions) : 1;
      map.set(dept, (map.get(dept) || 0) + pos);
    });
    const positionsPerDept = Array.from(map.entries()).map(
      ([department, positions]) => ({ department, positions })
    );
    return { total, active, urgent, positionsPerDept };
  }, [jobs]);

  // helper to show notifications
  const showSnackbar = useCallback((message, severity = "info") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  const fetchJobOpenings = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/hr/recruitment/openings");
      setJobs(response.data || []);
    } catch (error) {
      console.error("Error fetching job openings", error);
      if (error.response && error.response.status === 403) {
        showSnackbar("Access denied. Please log in again.", "error");
      }
    }
  }, [showSnackbar]);

  // call once on mount
  useEffect(() => {
    fetchJobOpenings();
  }, [fetchJobOpenings]);

  const openDialog = (job = null) => {
    setEditJobOpening(job);
    setFormData(
      job
        ? {
            title: job.title || "",
            description: job.description || "",
            department: job.department || "",
            status: job.status === Open ? Open : Closed,
          }
        : {
            title: "",
            description: "",
            department: "",
            status: "",
          }
    );
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditJobOpening(null);
    setFormData({
      title: "",
      description: "",
      department: "",
      status: "",
      location: "",
      jobType: "",
      positions: 1,
      urgent: false,
      startDate: "",
      endDate: "",
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.status) {
      showSnackbar("Please select a status", "warning");
      return;
    }

    try {
      if (editJobOpening) {
        // update locally
        setJobs((prev) =>
          prev.map((j) =>
            j.id === editJobOpening.id
              ? {
                  ...j,
                  title: formData.title,
                  description: formData.description,
                  department: formData.department,
                  status: formData.status,
                  location: formData.location,
                  jobType: formData.jobType,
                  positions: Number(formData.positions) || 1,
                  urgent: !!formData.urgent,
                  startDate: formData.startDate || null,
                  endDate: formData.endDate || null,
                }
              : j
          )
        );

        // if closing now and job was active, call close endpoint
        if (formData.status === Closed && editJobOpening.status === Open) {
          try {
            await axiosInstance.put(
              `/hr/recruitment/close/${editJobOpening.id}`
            );
          } catch (e) {
            /* ignore */
          }
        }

        showSnackbar("Job updated", "success");
      } else {
        // Build a minimal payload matching backend DTO (title, description, department).
        const payload = {
          title: formData.title,
          description: formData.description,
          department: formData.department,
        };

        try {
          await axiosInstance.post("/hr/recruitment/create", payload);
          showSnackbar("Job opening created successfully!", "success");
        } catch (err) {
          // fallback to local insertion if API fails
          const newJob = {
            id: `local-${Date.now()}`,
            title: formData.title,
            description: formData.description,
            department: formData.department,
            status: formData.status,
            location: formData.location,
            jobType: formData.jobType,
            positions: Number(formData.positions) || 1,
            urgent: !!formData.urgent,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null,
            postedDate: new Date().toISOString(),
          };
          setJobs((prev) => [newJob, ...prev]);
          showSnackbar("Job created locally (server call failed).", "warning");
        }
      }

      fetchJobOpenings();
      closeDialog();
    } catch (error) {
      console.error("Error saving job opening", error);
      showSnackbar("Failed to save job opening.", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Job Openings Section */}
      <Typography variant="h5" gutterBottom>
        Job Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              minHeight: 90,
              background: "#4B49AC",
              color: "#fff",
            }}
            elevation={1}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              Total vacancies
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {vacanciesSummary.total}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              minHeight: 90,
              background: "#7DA0FA",
              color: "#fff",
            }}
            elevation={1}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.95)" }}
            >
              Active vacancies
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {vacanciesSummary.active}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              minHeight: 90,
              background: "#F3797E",
              color: "#fff",
            }}
            elevation={1}
          >
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.95)" }}
            >
              Urgent hires
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {vacanciesSummary.urgent}
            </Typography>
          </Paper>
        </Grid>

        {/* Top departments card removed per request */}

        <Grid
          item
          xs={12}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            onClick={() => openDialog()}
            sx={{ height: 40 }}
          >
            New Job Opening
          </Button>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Tabs
          value={jobTab}
          onChange={(_, v) => {
            setJobTab(v);
            setPage(0);
          }}
          sx={{ mb: 2 }}
        >
          <Tab label="Current Vacancies" />
          <Tab label="Upcoming Vacancies" />
          <Tab label="Vacancies History" />
        </Tabs>

        <Box sx={{ p: 1 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by title"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDept}
                  label="Department"
                  onChange={(e) => {
                    setFilterDept(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {Array.from(
                    new Set(jobs.map((j) => j.department).filter(Boolean))
                  ).map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={filterType}
                  label="Job Type"
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {Array.from(
                    new Set(jobs.map((j) => j.jobType).filter(Boolean))
                  ).map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Location</InputLabel>
                <Select
                  value={filterLocation}
                  label="Location"
                  onChange={(e) => {
                    setFilterLocation(e.target.value);
                    setPage(0);
                  }}
                >
                  <MenuItem value="All">All</MenuItem>
                  {Array.from(
                    new Set(jobs.map((j) => j.location).filter(Boolean))
                  ).map((l) => (
                    <MenuItem key={l} value={l}>
                      {l}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} textAlign="right">
              <Button
                variant="outlined"
                onClick={() => {
                  setSearch("");
                  setJobTab(0);
                  setFilterDept("All");
                  setFilterType("All");
                  setFilterLocation("All");
                  setPage(0);
                }}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                sx={{ ml: 1 }}
                onClick={() => {
                  // export visible jobs
                  const header = [
                    "id",
                    "title",
                    "description",
                    "department",
                    "location",
                    "jobType",
                    "positions",
                    "status",
                    "urgent",
                    "postedDate",
                    "startDate",
                    "endDate",
                  ];
                  const rows = (() => {
                    const now = new Date();
                    let list = jobs.slice();
                    if (jobTab === 0)
                      list = list.filter(
                        (j) =>
                          j.status === Open &&
                          (!j.startDate || new Date(j.startDate) <= now)
                      );
                    else if (jobTab === 1)
                      list = list.filter(
                        (j) => j.startDate && new Date(j.startDate) > now
                      );
                    else list = list.filter((j) => j.status !== Open);
                    if (search && search.trim()) {
                      const q = search.toLowerCase();
                      list = list.filter((j) =>
                        (j.title || "").toLowerCase().includes(q)
                      );
                    }
                    if (filterDept !== "All")
                      list = list.filter((j) => j.department === filterDept);
                    if (filterType !== "All")
                      list = list.filter((j) => j.jobType === filterType);
                    if (filterLocation !== "All")
                      list = list.filter((j) => j.location === filterLocation);
                    return list.map((j) =>
                      header.map((h) => JSON.stringify(j[h] ?? "")).join(",")
                    );
                  })();
                  const blob = new Blob(
                    [[header.join(",")], ...rows].join("\n"),
                    { type: "text/csv" }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "vacancies_export.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>

          {/* compute filtered list */}
          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {(() => {
                  const now = new Date();
                  let list = jobs.slice();
                  if (jobTab === 0) {
                    // current: active jobs whose startDate is not in future
                    list = list.filter(
                      (j) =>
                        j.status === Open &&
                        (!j.startDate || new Date(j.startDate) <= now)
                    );
                  } else if (jobTab === 1) {
                    // upcoming: have a startDate in future
                    list = list.filter(
                      (j) => j.startDate && new Date(j.startDate) > now
                    );
                  } else {
                    // history: closed jobs
                    list = list.filter((j) => j.status !== Open);
                  }
                  if (search && search.trim()) {
                    const q = search.toLowerCase();
                    list = list.filter(
                      (j) =>
                        (j.title || "").toLowerCase().includes(q) ||
                        (j.department || "").toLowerCase().includes(q)
                    );
                  }

                  const paged = list.slice(
                    page * rowsPerPage,
                    page * rowsPerPage + rowsPerPage
                  );
                  if (paged.length === 0) {
                    return (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No job vacancies found.
                        </TableCell>
                      </TableRow>
                    );
                  }

                  return paged.map((j) => (
                    <TableRow key={j.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>{j.title}</Typography>
                      </TableCell>
                      <TableCell>{j.description}</TableCell>
                      <TableCell>{j.department}</TableCell>
                      <TableCell>
                        {j.postedDate
                          ? new Date(j.postedDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={j.status === Open ? Open : Closed}
                            size="small"
                            color={j.status === Open ? "success" : "default"}
                          />
                          {j.urgent && (
                            <Chip label="Urgent" size="small" color="error" />
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDialog(j);
                            }}
                          >
                            Edit
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ));
                })()}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={(() => {
              const now = new Date();
              let list = jobs.slice();
              if (jobTab === 0)
                list = list.filter(
                  (j) =>
                    j.status === Open &&
                    (!j.startDate || new Date(j.startDate) <= now)
                );
              else if (jobTab === 1)
                list = list.filter(
                  (j) => j.startDate && new Date(j.startDate) > now
                );
              else list = list.filter((j) => j.status !== Open);
              if (search && search.trim()) {
                const q = search.toLowerCase();
                list = list.filter(
                  (j) =>
                    (j.title || "").toLowerCase().includes(q) ||
                    (j.department || "").toLowerCase().includes(q)
                );
              }
              return list.length;
            })()}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Paper>

      {/* Details drawer removed */}

      {/* Job Opening Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {editJobOpening ? "Edit Job Opening" : "Add New Job Opening"}
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            name="title"
            margin="dense"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="dense"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <TextField
            label="Department"
            name="department"
            fullWidth
            margin="dense"
            value={formData.department}
            onChange={handleChange}
            required
          />

          <Select
            fullWidth
            name="status"
            value={formData.status}
            onChange={handleChange}
            margin="dense"
            displayEmpty
            required
            sx={{ mt: 2 }}
          >
            <MenuItem value="">
              <em>Select status</em>
            </MenuItem>
            <MenuItem value={Open}>{Open}</MenuItem>
            <MenuItem value={Closed}>{Closed}</MenuItem>
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editJobOpening ? "Save Changes" : "Add New Job Opening"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={handleSnackbarClose}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RecruitmentManagement;
