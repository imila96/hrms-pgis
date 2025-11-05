import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  InputAdornment,
  Pagination,
} from "@mui/material";
import { Edit, Search as SearchIcon } from "@mui/icons-material";
import api from "../../../AxiosInstance"; // calling backend

const ROLE_OPTIONS = ["ADMIN", "HR", "EMPLOYEE", "DIRECTOR"];

export default function UserManagement() {
  // main users table
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // pending password table
  const [pending, setPending] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(true);

  // assign password dialog (row-action)
  const [pwdOpen, setPwdOpen] = useState(false);
  const [pwdTarget, setPwdTarget] = useState(null); // {id,email,name,jobTitle}
  const [initialPassword, setInitialPassword] = useState("");

  // assign role dialog
  const [openRole, setOpenRole] = useState(false);
  const [roleUser, setRoleUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  // (kept for UI only; will NOT be sent)
  const [empFields, setEmpFields] = useState({
    name: "",
    jobTitle: "",
    contact: "",
    address: "",
  });

  // --- Search & Filter states ---
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Pagination states
  const [userPage, setUserPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const itemsPerPage = 5; // number of rows per page

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.filter((u) => u.adminPasswordAssigned));
    } finally {
      setLoading(false);
    }
  };

  const loadPending = async () => {
    setPendingLoading(true);
    try {
      const { data } = await api.get("/admin/users/pending-employees");
      setPending(data);
    } finally {
      setPendingLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadPending();
  }, []);

  // --- Filter Logic ---
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === "All" || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const filteredPending = pending.filter(
    (p) =>
      p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic for users
  const indexOfLastUser = userPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Pagination logic for pending users
  const indexOfLastPending = pendingPage * itemsPerPage;
  const indexOfFirstPending = indexOfLastPending - itemsPerPage;
  const currentPending = filteredPending.slice(
    indexOfFirstPending,
    indexOfLastPending
  );

  // Handlers
  const handleUserPageChange = (event, value) => setUserPage(value);
  const handlePendingPageChange = (event, value) => setPendingPage(value);

  /* ---------------- Assign initial password ---------------- */
  const openPwdDialog = (row) => {
    setPwdTarget(row);
    setInitialPassword("");
    setPwdOpen(true);
  };

  const assignInitialPassword = async () => {
    if (!pwdTarget?.employeeId) return;
    if (!initialPassword || initialPassword.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    try {
      // Create user for the existing employee
      await api.post(`/admin/users/create-user-for-employee`, {
        employeeId: pwdTarget.employeeId,
        email: pwdTarget.email,
        password: initialPassword,
        role: "EMPLOYEE" // Default role
      });
      setPwdOpen(false);
      setPwdTarget(null);
      setInitialPassword("");
      await Promise.all([loadUsers(), loadPending()]);
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Failed to create user account.");
    }
  };

  /* ---------------- Assign/Change role ---------------- */
  const openRoleDlg = (u) => {
    setRoleUser(u);
    setSelectedRole(u.roles[0] || "EMPLOYEE");
    setEmpFields({
      name: u.hasEmployee ? "" : u.email,
      jobTitle: u.hasEmployee ? "" : "Staff",
      contact: "",
      address: "",
    });
    setOpenRole(true);
  };

  // ✅ send ONLY roles; do not send employee fields
  const saveRole = async () => {
    try {
      await api.put(`/admin/users/${roleUser.id}/roles`, {
        roles: [selectedRole],
      });
      setOpenRole(false);
      setRoleUser(null);
      loadUsers();
    } catch (e) {
      console.error(e);
      alert("Failed to save role.");
    }
  };

  /* ---------------- Delete user ---------------- */
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      await Promise.all([loadUsers(), loadPending()]);
    } catch (e) {
      console.error(e);
      alert("Failed to delete user.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ===== Title ===== */}
      <Typography variant="h5" mb={2}>
        User Account Management
      </Typography>

      {/* 🔍 Search + Filter + Counts in one row */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        gap={2}
        mb={2}
      >
        {/* Left side: Search + Filter */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ flex: 1 }}
        >
          <TextField
            label="Search by Email or Role"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setUserPage(1);
              setPendingPage(1);
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
            <InputLabel>Filter by Role</InputLabel>
            <Select
              value={roleFilter}
              label="Filter by Role"
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setUserPage(1);
                setPendingPage(1);
              }}
            >
              <MenuItem value="All">All</MenuItem>
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Right side: User counts */}
        <Box display="flex" gap={2}>
          <Chip
            label={`Total Users: ${users.length}`}
            variant="outlined"
            color="primary"
          />
          <Chip
            label={`Pending Employees: ${pending.length}`}
            variant="outlined"
            color="warning"
          />
        </Box>
      </Box>

      {/* ===== Table 1: Users ===== */}
      <Paper sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Roles</strong>
              </TableCell>
              <TableCell>
                <strong>Employee Row</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Actions</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              currentUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.id}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.roles.length ? (
                      u.roles.map((r) => (
                        <Chip key={r} label={r} size="small" sx={{ mr: 0.5 }} />
                      ))
                    ) : (
                      <em>None</em>
                    )}
                  </TableCell>
                  <TableCell>{u.hasEmployee ? "Yes" : "No"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => openRoleDlg(u)}
                      title="Assign/Edit Role"
                    >
                      <Edit />
                    </IconButton>

                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="center" mt={2} mb={3}>
          <Pagination
            count={Math.ceil(filteredUsers.length / itemsPerPage)}
            page={userPage}
            onChange={handleUserPageChange}
            color="primary"
          />
        </Box>
      </Paper>

      {/* ===== Table 2: Pending Employee Accounts (need password set by Admin) ===== */}
      <Typography variant="h6" mb={1}>
        Pending Employee Accounts (Need User Account)
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Name</strong>
              </TableCell>
              <TableCell>
                <strong>NIC No</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Action</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pendingLoading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!pendingLoading && pending.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No pending employees.
                </TableCell>
              </TableRow>
            )}
            {!pendingLoading &&
              currentPending.map((p) => (
                <TableRow key={p.employeeId}>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.name || "-"}</TableCell>
                  <TableCell>{p.nicNo || "-"}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="contained"
                      onClick={() => openPwdDialog(p)}
                    >
                      Add User
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <Box display="flex" justifyContent="center" mt={2}>
          <Pagination
            count={Math.ceil(filteredPending.length / itemsPerPage)}
            page={pendingPage}
            onChange={handlePendingPageChange}
            color="primary"
          />
        </Box>
      </Paper>

      {/* ===== Assign Password Dialog ===== */}
      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)}>
        <DialogTitle>Create User Account for Employee</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <TextField
            label="Employee Name"
            value={pwdTarget?.name || ""}
            fullWidth
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Email"
            value={pwdTarget?.email || ""}
            fullWidth
            margin="dense"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Initial Password"
            type="password"
            fullWidth
            margin="dense"
            value={initialPassword}
            onChange={(e) => setInitialPassword(e.target.value)}
            helperText="At least 6 characters"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPwdOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={assignInitialPassword}
            disabled={!initialPassword || initialPassword.length < 6}
          >
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== Assign Role Dialog (fields disabled) ===== */}
      <Dialog open={openRole} onClose={() => setOpenRole(false)}>
        <DialogTitle>Assign Role</DialogTitle>
        <DialogContent sx={{ minWidth: 360 }}>
          <FormControl fullWidth margin="dense">
            <InputLabel id="role">Role</InputLabel>
            <Select
              labelId="role"
              label="Role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
            >
              {ROLE_OPTIONS.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Show but disabled so only role can be changed */}
          <TextField
            label="Name"
            fullWidth
            margin="dense"
            value={empFields.name}
            onChange={(e) =>
              setEmpFields({ ...empFields, name: e.target.value })
            }
            disabled
          />
          <TextField
            label="Job Title"
            fullWidth
            margin="dense"
            value={empFields.jobTitle}
            onChange={(e) =>
              setEmpFields({ ...empFields, jobTitle: e.target.value })
            }
            disabled
          />
          <TextField
            label="Contact"
            fullWidth
            margin="dense"
            value={empFields.contact}
            onChange={(e) =>
              setEmpFields({ ...empFields, contact: e.target.value })
            }
            disabled
          />
          <TextField
            label="Address"
            fullWidth
            margin="dense"
            value={empFields.address}
            onChange={(e) =>
              setEmpFields({ ...empFields, address: e.target.value })
            }
            disabled
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRole(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveRole}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
