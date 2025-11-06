// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Paper,
//   Snackbar,
//   Alert,
// } from "@mui/material";
// import { Edit, Delete } from "@mui/icons-material";
// import axiosInstance from "../../AxiosInstance";

// const EmployeeRecords = () => {
//   const [employees, setEmployees] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editEmp, setEditEmp] = useState(null);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     contact: "",
//     jobTitle: "",
//     hireDate: "",
//     address: "",
//   });

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: "",
//     severity: "info",
//   });

//   const [confirmDialog, setConfirmDialog] = useState({
//     open: false,
//     empId: null,
//     empName: "",
//   });

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   const fetchEmployees = async () => {
//     try {
//       const response = await axiosInstance.get("/hr/employees");
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//       showSnackbar("Failed to load employees", "error");
//     }
//   };

//   const showSnackbar = (message, severity = "info") => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleSnackbarClose = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const openDialog = (emp = null) => {
//     setEditEmp(emp);
//     setFormData(
//       emp
//         ? { ...emp }
//         : {
//             name: "",
//             email: "",
//             contact: "",
//             jobTitle: "",
//             hireDate: "",
//             address: "",
//           }
//     );
//     setDialogOpen(true);
//   };

//   const closeDialog = () => {
//     setDialogOpen(false);
//     setEditEmp(null);
//     setFormData({
//       name: "",
//       email: "",
//       contact: "",
//       jobTitle: "",
//       hireDate: "",
//       address: "",
//     });
//   };

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSave = async () => {
//     if (!formData.name || !formData.email || !formData.jobTitle) {
//       showSnackbar("Please fill all required fields", "warning");
//       return;
//     }

//     try {
//       if (editEmp) {
//         await axiosInstance.put(`/hr/employees/${editEmp.id}`, formData);
//         showSnackbar("Employee updated successfully", "success");
//       } else {
//         await axiosInstance.post("/hr/employees", formData);
//         showSnackbar("Employee added successfully", "success");
//       }
//       fetchEmployees();
//       closeDialog();
//     } catch (error) {
//       console.error("Error saving employee:", error);
//       showSnackbar("Failed to save employee", "error");
//     }
//   };

//   const openDeleteConfirm = (id, name) => {
//     setConfirmDialog({ open: true, empId: id, empName: name });
//   };

//   const handleDeleteConfirmed = async () => {
//     const { empId } = confirmDialog;
//     try {
//       await axiosInstance.delete(`/hr/employees/${empId}`);
//       showSnackbar("Employee deleted successfully", "success");
//       fetchEmployees();
//     } catch (error) {
//       console.error("Error deleting employee:", error);
//       showSnackbar("Failed to delete employee", "error");
//     } finally {
//       setConfirmDialog({ open: false, empId: null, empName: "" });
//     }
//   };

//   const handleDeleteCancel = () => {
//     setConfirmDialog({ open: false, empId: null, empName: "" });
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h5" mb={2}>
//         Employee Record Management
//       </Typography>

//       <Button variant="contained" onClick={() => openDialog()} sx={{ mb: 2 }}>
//         Add New Employee
//       </Button>

//       <Paper sx={{ overflowX: "auto" }}>
//         <Table sx={{ minWidth: 800 }}>
//           <TableHead>
//             <TableRow>
//               <TableCell>
//                 <strong>Name</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Email</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Contact</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Position</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Hire Date</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Address</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Actions</strong>
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {employees.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={7} align="center">
//                   No employee records.
//                 </TableCell>
//               </TableRow>
//             ) : (
//               employees.map((emp) => (
//                 <TableRow key={emp.id}>
//                   <TableCell>{emp.name}</TableCell>
//                   <TableCell>{emp.email}</TableCell>
//                   <TableCell>{emp.contact}</TableCell>
//                   <TableCell>{emp.jobTitle}</TableCell>
//                   <TableCell>{emp.hireDate}</TableCell>
//                   <TableCell
//                     sx={{
//                       maxWidth: 200,
//                       whiteSpace: "nowrap",
//                       overflow: "hidden",
//                       textOverflow: "ellipsis",
//                     }}
//                   >
//                     {emp.address}
//                   </TableCell>
//                   <TableCell>
//                     <IconButton color="primary" onClick={() => openDialog(emp)}>
//                       <Edit />
//                     </IconButton>
//                     <IconButton
//                       color="error"
//                       onClick={() => openDeleteConfirm(emp.id, emp.name)}
//                     >
//                       <Delete />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </Paper>

//       {/* Add / Edit Dialog */}
//       <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
//         <DialogTitle>
//           {editEmp ? "Edit Employee" : "Add New Employee"}
//         </DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Name"
//             name="name"
//             fullWidth
//             margin="normal"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//           <TextField
//             label="Email"
//             name="email"
//             fullWidth
//             margin="normal"
//             value={formData.email}
//             onChange={handleChange}
//             required
//           />
//           <TextField
//             label="Contact"
//             name="contact"
//             fullWidth
//             margin="normal"
//             value={formData.contact}
//             onChange={handleChange}
//           />
//           <TextField
//             label="Position"
//             name="jobTitle"
//             fullWidth
//             margin="normal"
//             value={formData.jobTitle}
//             onChange={handleChange}
//             required
//           />
//           <TextField
//             label="Hire Date"
//             name="hireDate"
//             type="date"
//             fullWidth
//             margin="normal"
//             value={formData.hireDate}
//             onChange={handleChange}
//             InputLabelProps={{ shrink: true }}
//           />
//           <TextField
//             label="Address"
//             name="address"
//             fullWidth
//             margin="normal"
//             value={formData.address}
//             onChange={handleChange}
//             multiline
//             rows={3}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={closeDialog}>Cancel</Button>
//           <Button variant="contained" onClick={handleSave}>
//             {editEmp ? "Save Changes" : "Add Employee"}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Delete Confirmation Dialog */}
//       <Dialog
//         open={confirmDialog.open}
//         onClose={handleDeleteCancel}
//         maxWidth="xs"
//         fullWidth
//       >
//         <DialogTitle>Confirm Delete</DialogTitle>
//         <DialogContent>
//           Are you sure you want to delete{" "}
//           <strong>{confirmDialog.empName}</strong>?
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleDeleteCancel}>Cancel</Button>
//           <Button
//             variant="contained"
//             color="error"
//             onClick={handleDeleteConfirmed}
//           >
//             Delete
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Snackbar */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={3000}
//         onClose={handleSnackbarClose}
//         anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       >
//         <Alert
//           onClose={handleSnackbarClose}
//           severity={snackbar.severity}
//           sx={{ width: "100%" }}
//         >
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default EmployeeRecords;
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
import { Edit, Visibility, Done, Close } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";

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

  // removed delete confirmation UI per updated requirements

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterDesignation, setFilterDesignation] = useState("");
  const [filterEmploymentType, setFilterEmploymentType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Stabilize the fetch function with useCallback so it has a stable identity.
  // This allows us to include it safely in the useEffect dependency array
  // (avoiding eslint-disable comments) and also reuse the same function
  // from other handlers like handleSave/handleDelete without recreating it
  // on every render.
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
  const handleEdit = (emp) => {
    const id = emp.employeeId || emp.id;
    navigate(`/hr/records/edit/${id}`);
  };

  // deletion removed from actions: no delete-related handlers

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
  const uniqueDepartments = useMemo(() => {
    const s = new Set();
    employees.forEach((e) => {
      const d = e.department || e.dept || e.departmentName;
      if (d) s.add(d);
    });
    return Array.from(s).sort();
  }, [employees]);

  const uniqueDesignations = useMemo(() => {
    const s = new Set();
    employees.forEach((e) => {
      const des = e.designation || e.jobTitle;
      if (des) s.add(des);
    });
    return Array.from(s).sort();
  }, [employees]);

  const uniqueEmploymentTypes = useMemo(() => {
    const s = new Set();
    employees.forEach((e) => {
      if (e.employmentType) s.add(e.employmentType);
    });
    return Array.from(s).sort();
  }, [employees]);

  const uniqueStatuses = useMemo(() => {
    const s = new Set();
    employees.forEach((e) => {
      if (e.status) s.add(e.status);
    });
    return Array.from(s).sort();
  }, [employees]);

  // filtered view based on search and job title filter
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return employees.filter((emp) => {
      const dept = emp.department || emp.dept || emp.departmentName || "";
      const des = emp.designation || emp.jobTitle || "";
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

  // ensure page resets when filters change (so we don't end up on an out-of-range page)
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
              {uniqueDepartments.map((d) => (
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
              {uniqueEmploymentTypes.map((t) => (
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
              {uniqueStatuses.map((s) => (
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
