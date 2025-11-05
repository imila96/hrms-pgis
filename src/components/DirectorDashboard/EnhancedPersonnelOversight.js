// src/components/DirectorDashboard/EnhancedPersonnelOversight.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Grid,
  TableContainer,
  TablePagination,
  Stack,
  Chip,
  FormControl,
  InputLabel,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

export default function EnhancedPersonnelOversight() {
  // === Employee Section ===
  const [employees, setEmployees] = useState([]);
  const [searchEmp, setSearchEmp] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [empPage, setEmpPage] = useState(0);
  const [rowsPerPageEmp, setRowsPerPageEmp] = useState(5);

  // === Recruitment Section ===
  const [jobs, setJobs] = useState([]);
  const [tab, setTab] = useState(0);
  const [searchJob, setSearchJob] = useState("");
  const [filterJobDept, setFilterJobDept] = useState("All");
  const [jobPage, setJobPage] = useState(0);
  const [rowsPerPageJob, setRowsPerPageJob] = useState(5);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [decisionType, setDecisionType] = useState(null);
  const [reason, setReason] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    sev: "info",
  });

  const showSnackbar = useCallback((msg, sev = "info") => {
    setSnackbar({ open: true, msg, sev });
  }, []);
  const handleCloseSnackbar = () =>
    setSnackbar((s) => ({ ...s, open: false }));

  // === Fetch Data ===
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const { data } = await axiosInstance.get("/hr/employees");
        setEmployees(data);
      } catch {
        setEmployees([
          {
            id: 1,
            name: "Alice Johnson",
            department: "HR",
            role: "Manager",
            location: "Colombo",
            email: "alice@corp.com",
            status: "Active",
            hireDate: "2022-01-15",
          },
          {
            id: 2,
            name: "Brian Lee",
            department: "IT",
            role: "Engineer",
            location: "Kandy",
            email: "brian@corp.com",
            status: "On Leave",
            hireDate: "2023-04-10",
          },
          {
            id: 3,
            name: "Carla Gomez",
            department: "Finance",
            role: "Analyst",
            location: "Galle",
            email: "carla@corp.com",
            status: "Probation",
            hireDate: "2021-11-22",
          },
        ]);
      }
    };

    const loadJobs = async () => {
      try {
        const { data } = await axiosInstance.get(
          "/director/recruitment/jobs"
        );
        setJobs(data);
      } catch {
        setJobs([
          {
            id: 1,
            title: "Software Engineer",
            department: "IT",
            applicants: [
              { id: 11, name: "Nimal Perera", status: "Pending", reason: "" },
              {
                id: 12,
                name: "Kasun Jay",
                status: "Approved",
                reason: "Strong background",
              },
            ],
          },
          {
            id: 2,
            title: "HR Assistant",
            department: "HR",
            applicants: [
              { id: 13, name: "Dilani Silva", status: "Pending", reason: "" },
              {
                id: 14,
                name: "Ruwan Fernando",
                status: "Rejected",
                reason: "Limited experience",
              },
            ],
          },
        ]);
      }
    };

    loadEmployees();
    loadJobs();
  }, []);

  // === EMPLOYEE SUMMARY ===
  const empSummary = useMemo(() => {
    const total = employees.length;
    const active = employees.filter((e) => e.status === "Active").length;
    const onLeave = employees.filter((e) => e.status === "On Leave").length;
    const probation = employees.filter((e) => e.status === "Probation").length;
    return { total, active, onLeave, probation };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    let list = employees.slice();
    if (searchEmp.trim()) {
      const q = searchEmp.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.department.toLowerCase().includes(q)
      );
    }
    if (filterDept !== "All")
      list = list.filter((e) => e.department === filterDept);
    if (filterStatus !== "All")
      list = list.filter((e) => e.status === filterStatus);
    return list;
  }, [employees, searchEmp, filterDept, filterStatus]);

  // === RECRUITMENT SUMMARY ===
  const recSummary = useMemo(() => {
    const total = jobs.reduce((sum, j) => sum + j.applicants.length, 0);
    const pending = jobs.reduce(
      (sum, j) => sum + j.applicants.filter((a) => a.status === "Pending").length,
      0
    );
    const approved = jobs.reduce(
      (sum, j) => sum + j.applicants.filter((a) => a.status === "Approved").length,
      0
    );
    const rejected = jobs.reduce(
      (sum, j) => sum + j.applicants.filter((a) => a.status === "Rejected").length,
      0
    );
    return { total, pending, approved, rejected };
  }, [jobs]);

  // === Director Decision Logic ===
  const openDecisionDialog = (applicant, type) => {
    setSelectedApplicant(applicant);
    setDecisionType(type);
    setReason("");
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedApplicant(null);
    setDecisionType(null);
    setReason("");
  };
  const handleDecision = async () => {
    if (!reason.trim()) {
      showSnackbar("Please provide a reason.", "warning");
      return;
    }
    const approve = decisionType === "approve";
    try {
      await axiosInstance.patch(
        `/director/recruitment/decision/${selectedApplicant.id}?approve=${approve}`,
        { reason }
      );
      setJobs((prev) =>
        prev.map((job) => ({
          ...job,
          applicants: job.applicants.map((a) =>
            a.id === selectedApplicant.id
              ? { ...a, status: approve ? "Approved" : "Rejected", reason }
              : a
          ),
        }))
      );
      showSnackbar(
        approve ? "Candidate approved successfully." : "Candidate rejected.",
        "success"
      );
      closeDialog();
    } catch {
      showSnackbar("Failed to submit decision.", "error");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* === EMPLOYEE TABLE === */}
      <Typography variant="h5" gutterBottom>
        Employee Overview
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: "Total Employees", value: empSummary.total, color: "#4B49AC" },
          { label: "Active", value: empSummary.active, color: "#7DA0FA" },
          { label: "On Leave", value: empSummary.onLeave, color: "#F3797E" },
          { label: "Probation", value: empSummary.probation, color: "#F8C471" },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper sx={{ p: 2, background: card.color, color: "#fff" }}>
              <Typography variant="caption">{card.label}</Typography>
              <Typography variant="h4" fontWeight={700}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2, mb: 5 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or department"
              value={searchEmp}
              onChange={(e) => setSearchEmp(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDept}
                label="Department"
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {[...new Set(employees.map((e) => e.department))].map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {[...new Set(employees.map((e) => e.status))].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Hire Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees
                .slice(
                  empPage * rowsPerPageEmp,
                  empPage * rowsPerPageEmp + rowsPerPageEmp
                )
                .map((e) => (
                  <TableRow key={e.id} hover>
                    <TableCell>{e.name}</TableCell>
                    <TableCell>{e.department}</TableCell>
                    <TableCell>{e.role}</TableCell>
                    <TableCell>{e.location}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={e.status}
                        size="small"
                        color={
                          e.status === "Active"
                            ? "success"
                            : e.status === "On Leave"
                            ? "warning"
                            : e.status === "Probation"
                            ? "info"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>{e.hireDate}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={empPage}
          onPageChange={(_, p) => setEmpPage(p)}
          rowsPerPage={rowsPerPageEmp}
          onRowsPerPageChange={(e) => {
            setRowsPerPageEmp(parseInt(e.target.value, 10));
            setEmpPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* === RECRUITMENT DECISIONS === */}
      <Typography variant="h5" gutterBottom>
        Recruitment Decisions
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { label: "Total Applicants", value: recSummary.total, color: "#4B49AC" },
          { label: "Pending", value: recSummary.pending, color: "#7DA0FA" },
          { label: "Approved", value: recSummary.approved, color: "#4CAF50" },
          { label: "Rejected", value: recSummary.rejected, color: "#F3797E" },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper sx={{ p: 2, background: card.color, color: "#fff" }}>
              <Typography variant="caption">{card.label}</Typography>
              <Typography variant="h4" fontWeight={700}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Pending Applications" />
          <Tab label="Approved" />
          <Tab label="Rejected" />
        </Tabs>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by job title"
              value={searchJob}
              onChange={(e) => setSearchJob(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={filterJobDept}
                label="Department"
                onChange={(e) => setFilterJobDept(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                {[...new Set(jobs.map((j) => j.department))].map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Applicant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                const list = [];
                jobs.forEach((job) => {
                  if (
                    filterJobDept === "All" ||
                    job.department === filterJobDept
                  ) {
                    job.applicants.forEach((a) => {
                      if (
                        (tab === 0 && a.status === "Pending") ||
                        (tab === 1 && a.status === "Approved") ||
                        (tab === 2 && a.status === "Rejected")
                      ) {
                        if (
                          !searchJob ||
                          job.title
                            .toLowerCase()
                            .includes(searchJob.toLowerCase())
                        ) {
                          list.push({ ...a, jobTitle: job.title, dept: job.department });
                        }
                      }
                    });
                  }
                });

                const paged = list.slice(
                  jobPage * rowsPerPageJob,
                  jobPage * rowsPerPageJob + rowsPerPageJob
                );

                if (paged.length === 0) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No records found.
                      </TableCell>
                    </TableRow>
                  );
                }

                return paged.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.jobTitle}</TableCell>
                    <TableCell>{a.dept}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={a.status}
                        size="small"
                        color={
                          a.status === "Approved"
                            ? "success"
                            : a.status === "Rejected"
                            ? "error"
                            : "warning"
                        }
                      />
                    </TableCell>
                    <TableCell>{a.reason || "-"}</TableCell>
                    <TableCell align="right">
                      {a.status === "Pending" ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => openDecisionDialog(a, "reject")}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            color="success"
                            variant="contained"
                            onClick={() => openDecisionDialog(a, "approve")}
                          >
                            Approve
                          </Button>
                        </Stack>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={jobs.reduce(
            (sum, j) =>
              sum +
              j.applicants.filter((a) =>
                tab === 0
                  ? a.status === "Pending"
                  : tab === 1
                  ? a.status === "Approved"
                  : a.status === "Rejected"
              ).length,
            0
          )}
          page={jobPage}
          onPageChange={(_, p) => setJobPage(p)}
          rowsPerPage={rowsPerPageJob}
          onRowsPerPageChange={(e) => {
            setRowsPerPageJob(parseInt(e.target.value, 10));
            setJobPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* === Decision Dialog === */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {decisionType === "approve" ? "Approve Candidate" : "Reject Candidate"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Candidate: <strong>{selectedApplicant?.name}</strong>
          </Typography>
          <TextField
            multiline
            rows={3}
            label="Reason"
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter decision reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleDecision}
            sx={{
              backgroundColor:
                decisionType === "approve" ? "#4B49AC" : "#E53935",
              "&:hover": {
                backgroundColor:
                  decisionType === "approve" ? "#7DA0FA" : "#C62828",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.sev} onClose={handleCloseSnackbar}>
          {snackbar.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
