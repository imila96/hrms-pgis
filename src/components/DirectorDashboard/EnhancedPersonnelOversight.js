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
  TableContainer,
  TablePagination,
  IconButton,
  TextField,
  Paper,
  Snackbar,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";

const DEPARTMENTS = [
  "General Administration Division",
  "Finance Administration Division",
  "IT & Technical Support Unit",
  "Maintenance & Facilities Unit",
  "Biochemistry and Molecular Biology",
  "Biomedical Sciences",
  "Chemical Sciences",
  "Earth Sciences",
  "Environmental Science",
  "Mathematics",
  "Physics",
  "Plant Sciences",
  "Science Education",
  "Statistics and Computer Science",
  "Zoological Sciences",
  "Human Resources",
  "other",
];

const EMPLOYMENT_TYPES = ["Permanent", "Contract", "Temporary"];

const STATUS = ["Active", "Inactive", "Hold"];
// statuses that should appear in Vacancies History
const HISTORY_STATUSES = ["Closed", "Approved", "Rejected"];
const HISTORY_STATUSES_LOWER = HISTORY_STATUSES.map((s) => s.toLowerCase());

export default function EnhancedPersonnelOversight() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // pagination for employee table
  const [empPage, setEmpPage] = useState(0);
  const [rowsPerPageEmp, setRowsPerPageEmp] = useState(10);

  // Job management state (cloned from RecruitmentManagement.js)
  const [jobs, setJobs] = useState([]);
  const [jobTab, setJobTab] = useState(0);
  const [searchJob, setSearchJob] = useState("");
  const [jobPage, setJobPage] = useState(0);
  const [rowsPerPageJob, setRowsPerPageJob] = useState(5);
  const [filterJobDept, setFilterJobDept] = useState("All");
  const [filterJobType, setFilterJobType] = useState("All");
  const [filterJobLocation, setFilterJobLocation] = useState("All");

  // Search & filter state
  const [searchEmp, setSearchEmp] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterEmploymentType, setFilterEmploymentType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // fetch employeeSummaryDto from backend
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/hr/employees/summary");
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
      setSnackbar({
        open: true,
        message: "Failed to load employees",
        severity: "error",
      });
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // fetch job openings for director view (uses HR recruitment endpoint as source)
  const fetchJobOpenings = useCallback(async () => {
    try {
      const resp = await axiosInstance.get("/hr/recruitment/openings");
      setJobs(resp.data || []);
    } catch (err) {
      console.error("Error fetching job openings", err);
      setJobs([]);
      setSnackbar({
        open: true,
        message: "Failed to load job openings",
        severity: "error",
      });
    }
  }, []);

  useEffect(() => {
    fetchJobOpenings();
  }, [fetchJobOpenings]);

  const vacanciesSummary = useMemo(() => {
    // total: count of Open vacancies
    const total = jobs.filter(
      (j) => ((j.status || "") + "").toLowerCase() === "open"
    ).length;
    // active: count of Approved vacancies
    const active = jobs.filter(
      (j) => ((j.status || "") + "").toLowerCase() === "approved"
    ).length;
    // urgent: count of jobs marked urgent OR with status 'urgent'
    const urgent = jobs.filter(
      (j) =>
        j && (j.urgent || ((j.status || "") + "").toLowerCase() === "urgent")
    ).length;
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

  // Approve / Reject handler for jobs - optimistic update + backend call
  const handleJobDecision = async (jobId, approve) => {
    // optimistic update
    const prev = jobs.slice();
    setJobs((s) =>
      s.map((j) =>
        j.id === jobId ? { ...j, status: approve ? "Approved" : "Rejected" } : j
      )
    );

    try {
      // director decision endpoint (best-effort guess). If your backend uses a different path, we can change it.
      await axiosInstance.patch(
        `/hr/recruitment/decision/${jobId}?approve=${approve}`
      );
      setSnackbar({
        open: true,
        message: `Job ${approve ? "approved" : "rejected"}`,
        severity: "success",
      });
      // refresh list
      fetchJobOpenings();
    } catch (err) {
      console.error("Decision call failed", err);
      // revert optimistic
      setJobs(prev);
      setSnackbar({
        open: true,
        message: `Failed to ${approve ? "approve" : "reject"} job`,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // navigation handler for view

  // Overview values (total from table for now; other values are placeholders)
  const totalEmployees = employees.length;
  const activeEmployees = useMemo(() => {
    if (!employees || employees.length === 0) return 0;
    return employees.filter((emp) => {
      const stat = (
        (emp.status || emp.employmentStatus || "") + ""
      ).toLowerCase();
      return stat === "active";
    }).length;
  }, [employees]);

  // derive unique job titles for the filter dropdown
  const uniqueDesignations = useMemo(() => {
    const s = new Set();
    employees.forEach((e) => {
      const des = e.designation;
      if (des) s.add(des);
    });
    return Array.from(s).sort();
  }, [employees]);

  // filtered view based on search and job title filter
  const filteredEmployees = useMemo(() => {
    const q = searchEmp.trim().toLowerCase();
    return employees.filter((emp) => {
      const dept = emp.department || "";
      const des = emp.designation || "";
      const empType = emp.employmentType || "";
      const stat = emp.status || "";

      if (filterDept && dept !== filterDept) return false;
      if (filterDesignation && des !== filterDesignation) return false;
      if (filterEmploymentType && empType !== filterEmploymentType)
        return false;
      if (filterStatus && stat !== filterStatus) return false;

      if (!q) return true;
      return (
        (emp.name || "").toLowerCase().includes(q) ||
        (emp.email || "").toLowerCase().includes(q) ||
        des.toLowerCase().includes(q) ||
        dept.toLowerCase().includes(q)
      );
    });
  }, [
    employees,
    searchEmp,
    filterDept,
    filterDesignation,
    filterEmploymentType,
    filterStatus,
  ]);

  // ensure page resets when filters change
  useEffect(() => {
    setEmpPage(0);
  }, [
    searchEmp,
    filterDept,
    filterDesignation,
    filterEmploymentType,
    filterStatus,
    employees.length,
  ]);

  const handleChangePage = (_, newPage) => setEmpPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPageEmp(parseInt(e.target.value, 10));
    setEmpPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <BackButton />
      <Typography variant="h5" mb={2}>
        Personnel Oversight
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
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 1, mt: 1 }}>
        Employee Table
      </Typography>

      {/* Add New Employee button removed per request */}

      {/* Search and Filter controls */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <TextField
            label="Search by name, email or position"
            value={searchEmp}
            onChange={(e) => setSearchEmp(e.target.value)}
            fullWidth
            size="small"
            sx={{ minWidth: 400 }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="dept-filter-label">Department</InputLabel>
            <Select
              labelId="dept-filter-label"
              label="Department"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
            >
              <MenuItem value="">All Departments</MenuItem>
              {DEPARTMENTS.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="des-filter-label">Designation</InputLabel>
            <Select
              labelId="des-filter-label"
              label="Designation"
              value={filterDesignation}
              onChange={(e) => setFilterDesignation(e.target.value)}
            >
              <MenuItem value="">All Designations</MenuItem>
              {uniqueDesignations.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="empType-filter-label">Employment Type</InputLabel>
            <Select
              labelId="empType-filter-label"
              label="Employment Type"
              value={filterEmploymentType}
              onChange={(e) => setFilterEmploymentType(e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {EMPLOYMENT_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {STATUS.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setSearchEmp("");
              setFilterDept("");
              setFilterDesignation("");
              setFilterEmploymentType("");
              setFilterStatus("");
            }}
            sx={{ width: "100%" }}
          >
            Clear
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} sx={{ mb: 2 }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Employee ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Designation</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Employment Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredEmployees
              .slice(
                empPage * rowsPerPageEmp,
                empPage * rowsPerPageEmp + rowsPerPageEmp
              )
              .map((emp) => {
                const employeeId = emp.employeeId || emp.id || "-";
                const dept =
                  emp.department || emp.dept || emp.departmentName || "-";
                const des = emp.designation || emp.jobTitle || "-";
                const empType = emp.employmentType || "-";
                const stat = emp.status || "-";

                return (
                  <TableRow key={employeeId} hover>
                    <TableCell>{employeeId}</TableCell>
                    <TableCell>
                      <Typography fontWeight={700}>{emp.name}</Typography>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{dept}</TableCell>
                    <TableCell>{des}</TableCell>
                    <TableCell>{empType}</TableCell>
                    <TableCell>{stat}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="primary"
                        onClick={() =>
                          navigate(`/hr/records/view/${employeeId}`)
                        }
                        title="View"
                      >
                        <Visibility />
                      </IconButton>
                      {/* Edit button removed per request */}
                    </TableCell>
                  </TableRow>
                );
              })}

            {filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No employee records.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filteredEmployees.length}
          page={empPage}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPageEmp}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {/* ----------------- Job Management (cloned/adapted) ----------------- */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Job Management
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 90 }} elevation={1}>
            <Typography variant="caption">Total vacancies</Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {vacanciesSummary.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 90 }} elevation={1}>
            <Typography variant="caption">Active vacancies</Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {vacanciesSummary.active}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, minHeight: 90 }} elevation={1}>
            <Typography variant="caption">Urgent hires</Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {vacanciesSummary.urgent}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 4 }}>
        <Tabs
          value={jobTab}
          onChange={(_, v) => {
            setJobTab(v);
            setJobPage(0);
          }}
          sx={{ mb: 2 }}
        >
          <Tab label="Current Vacancies" />
          <Tab label="Vacancies History" />
        </Tabs>

        <Box sx={{ p: 1 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search by title"
                value={searchJob}
                onChange={(e) => {
                  setSearchJob(e.target.value);
                  setJobPage(0);
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterJobDept}
                  label="Department"
                  onChange={(e) => {
                    setFilterJobDept(e.target.value);
                    setJobPage(0);
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
                  value={filterJobType}
                  label="Job Type"
                  onChange={(e) => {
                    setFilterJobType(e.target.value);
                    setJobPage(0);
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
                  value={filterJobLocation}
                  label="Location"
                  onChange={(e) => {
                    setFilterJobLocation(e.target.value);
                    setJobPage(0);
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
                  setSearchJob("");
                  setJobTab(0);
                  setFilterJobDept("All");
                  setFilterJobType("All");
                  setFilterJobLocation("All");
                  setJobPage(0);
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Job Title</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Posted</TableCell>
                  <TableCell>Status</TableCell>
                  {jobTab === 0 && <TableCell align="right">Actions</TableCell>}
                </TableRow>
              </TableHead>

              <TableBody>
                {(() => {
                  const now = new Date();
                  let list = jobs.slice();
                  if (jobTab === 0) {
                    // Current: everything except explicit history statuses
                    list = list.filter(
                      (j) =>
                        !HISTORY_STATUSES_LOWER.includes(
                          ((j.status || "") + "").toLowerCase()
                        )
                    );
                    // also exclude future start dates
                    list = list.filter(
                      (j) => !j.startDate || new Date(j.startDate) <= now
                    );
                  } else {
                    // History: only jobs whose status is Closed, Approved or Rejected
                    list = list.filter((j) =>
                      HISTORY_STATUSES_LOWER.includes(
                        ((j.status || "") + "").toLowerCase()
                      )
                    );
                  }
                  if (searchJob && searchJob.trim()) {
                    const q = searchJob.toLowerCase();
                    list = list.filter(
                      (j) =>
                        (j.title || "").toLowerCase().includes(q) ||
                        (j.department || "").toLowerCase().includes(q)
                    );
                  }
                  if (filterJobDept !== "All")
                    list = list.filter((j) => j.department === filterJobDept);
                  if (filterJobType !== "All")
                    list = list.filter((j) => j.jobType === filterJobType);
                  if (filterJobLocation !== "All")
                    list = list.filter((j) => j.location === filterJobLocation);

                  const paged = list.slice(
                    jobPage * rowsPerPageJob,
                    jobPage * rowsPerPageJob + rowsPerPageJob
                  );
                  if (paged.length === 0) {
                    return (
                      <TableRow>
                        <TableCell
                          colSpan={jobTab === 0 ? 6 : 5}
                          align="center"
                        >
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
                            label={j.status}
                            size="small"
                            color={
                              (j.status || "") === "Open"
                                ? "success"
                                : "default"
                            }
                          />
                          {j.urgent && (
                            <Chip label="Urgent" size="small" color="error" />
                          )}
                        </Stack>
                      </TableCell>
                      {jobTab === 0 && (
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJobDecision(j.id, true);
                              }}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleJobDecision(j.id, false);
                              }}
                            >
                              Reject
                            </Button>
                          </Stack>
                        </TableCell>
                      )}
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
                    !HISTORY_STATUSES.includes(j.status) &&
                    (!j.startDate || new Date(j.startDate) <= now)
                );
              else
                list = list.filter((j) => HISTORY_STATUSES.includes(j.status));
              if (searchJob && searchJob.trim()) {
                const q = searchJob.toLowerCase();
                list = list.filter(
                  (j) =>
                    (j.title || "").toLowerCase().includes(q) ||
                    (j.department || "").toLowerCase().includes(q)
                );
              }
              if (filterJobDept !== "All")
                list = list.filter((j) => j.department === filterJobDept);
              if (filterJobType !== "All")
                list = list.filter((j) => j.jobType === filterJobType);
              if (filterJobLocation !== "All")
                list = list.filter((j) => j.location === filterJobLocation);
              return list.length;
            })()}
            page={jobPage}
            onPageChange={(_, newPage) => setJobPage(newPage)}
            rowsPerPage={rowsPerPageJob}
            onRowsPerPageChange={(e) => {
              setRowsPerPageJob(parseInt(e.target.value, 10));
              setJobPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Paper>

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
}
