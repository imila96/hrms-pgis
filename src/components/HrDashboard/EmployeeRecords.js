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
} from "@mui/material";
import { Edit, Visibility } from "@mui/icons-material";
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

const EmployeeRecords = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // pagination for employee table
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterEmploymentType, setFilterEmploymentType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // fetch employeeSummaryDto from backend
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axiosInstance.get("/hr/employees/summary");
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

  const showSnackbar = (message, severity = "info") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // navigation handlers for add/edit
  const handleAdd = () => navigate("/hr/records/newEmployee");
  const handleEdit = (emp) => {
    const id = emp.employeeId || emp.id;
    navigate(`/hr/records/edit/${id}`);
  };

  // Handlers for profile change requests (approve / reject)

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
    const q = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      const dept = emp.department || "";
      const des = emp.designation || "";
      const empType = emp.employmentType || "";
      const stat = emp.status || "";

      if (filterDepartment && dept !== filterDepartment) return false;
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
    searchQuery,
    filterDepartment,
    filterDesignation,
    filterEmploymentType,
    filterStatus,
  ]);

  // ensure page resets when filters change
  useEffect(() => {
    setPage(0);
  }, [
    searchQuery,
    filterDepartment,
    filterDesignation,
    filterEmploymentType,
    filterStatus,
    employees.length,
  ]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <BackButton />
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
            sx={{ minWidth: 400 }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <FormControl fullWidth size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="dept-filter-label">Department</InputLabel>
            <Select
              labelId="dept-filter-label"
              label="Department"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
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
              setSearchQuery("");
              setFilterDepartment("");
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
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
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
                      <IconButton
                        color="primary"
                        onClick={() => handleEdit(emp)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
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
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {/* Add/Edit dialog removed — using route-based CreateEditProfile page */}

      {/* Delete flow removed - deletion not available from UI anymore */}

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
