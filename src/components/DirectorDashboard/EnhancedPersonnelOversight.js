import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  MenuItem,
  Divider,
  Pagination,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from "@mui/material";
import { Download } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axiosInstance from "../../AxiosInstance";

export default function EnhancedPersonnelOversight() {
  const [employees, setEmployees] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [page, setPage] = useState(1);
  const pageSize = 9;
  const navigate = useNavigate();

  // === Recruitment Management (Director decisions) ===
  const [jobOpenings, setJobOpenings] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [decisionType, setDecisionType] = useState(null);
  const [reason, setReason] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const departments = ["HR", "Finance", "IT", "Marketing"];
  const roles = ["Manager", "Engineer", "Analyst", "Intern"];

  // === Fetch Employees ===
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get(
          "http://localhost:8080/hr/employees"
        );
        setEmployees(data);
      } catch {
        // fallback demo data
        setEmployees([
          {
            id: 1,
            name: "Alice Johnson",
            email: "alice@corp.com",
            contact: "0701234567",
            jobTitle: "Manager",
            department: "HR",
            hireDate: "2022-01-15",
            address: "Colombo",
            status: "Active",
          },
          {
            id: 2,
            name: "Brian Lee",
            email: "brian@corp.com",
            contact: "0702223333",
            jobTitle: "Engineer",
            department: "IT",
            hireDate: "2023-04-10",
            address: "Galle",
            status: "On Leave",
          },
          {
            id: 3,
            name: "Carla Gomez",
            email: "carla@corp.com",
            contact: "0704445555",
            jobTitle: "Analyst",
            department: "Finance",
            hireDate: "2021-11-22",
            address: "Kandy",
            status: "Probation",
          },
        ]);
      }
    };
    load();
  }, []);

  // === Fetch Recruitment Data (for Director) ===
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await axiosInstance.get(
          "http://localhost:8080/director/recruitment/jobs"
        );
        setJobOpenings(data);
      } catch {
        // fallback data
        setJobOpenings([
          {
            id: 1,
            title: "Software Engineer",
            department: "IT",
            applicants: [
              { id: 11, name: "Nimal Perera", status: "Pending" },
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
              { id: 13, name: "Dilani Silva", status: "Pending" },
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
    loadJobs();
  }, []);

  // === Filter, Sort, Paginate ===
  const filtered = useMemo(() => {
    let data = [...employees];
    const f = filterText.trim().toLowerCase();

    if (filterText.trim()) {
      data = data.filter((e) => {
        const name = e.name || "";
        const job = e.jobTitle || "";
        const dept = e.department || "";
        return (
          name.toLowerCase().includes(f) ||
          job.toLowerCase().includes(f) ||
          dept.toLowerCase().includes(f)
        );
      });
    }

    if (department) data = data.filter((e) => e.department === department);
    if (role) data = data.filter((e) => e.jobTitle === role);

    data.sort((a, b) =>
      sortKey === "hireDate"
        ? new Date(a.hireDate) - new Date(b.hireDate)
        : (a.name || "").localeCompare(b.name || "")
    );

    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [employees, filterText, department, role, sortKey, page]);

  const totalPages = Math.ceil(employees.length / pageSize);

  // === Exports ===
  const exportCSV = () => {
    const csv = Papa.unparse(filtered);
    saveAs(new Blob([csv], { type: "text/csv" }), "employees.csv");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["Name", "Email", "Contact", "Job Title", "Hire Date", "Address"]],
      body: filtered.map((e) => [
        e.name,
        e.email,
        e.contact,
        e.jobTitle,
        e.hireDate,
        e.address,
      ]),
    });
    doc.save("employees.pdf");
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const openEmployeeDetail = (id) => navigate(`/director/employee/${id}`);

  const chipColor = (status) => {
    switch (status) {
      case "Active":
      case "Approved":
        return "success";
      case "On Leave":
      case "Pending":
        return "warning";
      case "Probation":
        return "info";
      case "Rejected":
        return "error";
      default:
        return "default";
    }
  };

  // === Recruitment Decision Logic ===
  const openDecisionDialog = (app, type) => {
    setSelectedApplicant(app);
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

  const submitDecision = async () => {
    if (!reason.trim()) {
      setSnack({ open: true, msg: "Please provide a reason.", sev: "warning" });
      return;
    }
    try {
      const approve = decisionType === "approve";
      await axiosInstance.patch(
        `http://localhost:8080/director/recruitment/decision/${selectedApplicant.id}?approve=${approve}`,
        { reason }
      );
      setJobOpenings((prev) =>
        prev.map((job) => ({
          ...job,
          applicants: job.applicants.map((a) =>
            a.id === selectedApplicant.id
              ? { ...a, status: approve ? "Approved" : "Rejected", reason }
              : a
          ),
        }))
      );
      setSnack({
        open: true,
        msg: approve ? "Candidate approved." : "Candidate rejected.",
        sev: "success",
      });
      closeDialog();
    } catch {
      setSnack({
        open: true,
        msg: "Failed to submit decision.",
        sev: "error",
      });
    }
  };

  // === MAIN RETURN ===
  return (
    <Box
      sx={{
        backgroundColor: "#f6f7fb",
        minHeight: "100vh",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* === Filter & Export Toolbar === */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: "#4B49AC", flexGrow: 1, minWidth: 160 }}
        >
          Personnel Oversight
        </Typography>

        <TextField
          label="Search"
          size="small"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ minWidth: 200 }}
        />

        <TextField
          label="Department"
          size="small"
          select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {departments.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Role"
          size="small"
          select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Sort by"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="name">Name</MenuItem>
          <MenuItem value="hireDate">Hire Date</MenuItem>
        </TextField>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportCSV}
            sx={{
              borderColor: "#4B49AC",
              color: "#4B49AC",
              textTransform: "none",
            }}
          >
            CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={exportPDF}
            sx={{
              backgroundColor: "#4B49AC",
              textTransform: "none",
              "&:hover": { backgroundColor: "#7DA0FA" },
            }}
          >
            PDF
          </Button>
        </Box>
      </Paper>

      {/* === Employee Cards (Untouched) === */}
      <Grid container spacing={2} alignItems="stretch">
        {filtered.map((e) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            lg={3}
            key={e.id}
            sx={{ display: "flex" }}
          >
            <Paper
              elevation={3}
              onClick={() => openEmployeeDetail(e.id)}
              sx={{
                flexGrow: 1,
                borderRadius: 3,
                p: 2.5,
                cursor: "pointer",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: 300,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 24px rgba(75,73,172,0.15)",
                },
              }}
            >
              <Box>
                <Avatar
                  sx={{
                    bgcolor: "#4B49AC",
                    width: 64,
                    height: 64,
                    fontSize: 22,
                    fontWeight: 600,
                    margin: "0 auto 10px",
                  }}
                >
                  {getInitials(e.name)}
                </Avatar>
                <Typography fontWeight={700} color="#4B49AC" noWrap>
                  {e.name || "Unnamed"}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {e.jobTitle || "-"}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                  noWrap
                >
                  {e.department || "-"}
                </Typography>
                <Chip
                  label={e.status || "Active"}
                  color={chipColor(e.status)}
                  size="small"
                  sx={{ mb: 1 }}
                />
                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  Hire Date: {e.hireDate || "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {e.address || "-"}
                </Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  size="small"
                  fullWidth
                  variant="contained"
                  sx={{
                    backgroundColor: "#4B49AC",
                    "&:hover": { backgroundColor: "#7DA0FA" },
                    textTransform: "none",
                    fontSize: 13,
                  }}
                >
                  View Details
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}

        {filtered.length === 0 && (
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                color: "text.secondary",
              }}
            >
              No employees found
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* === Pagination (Untouched) === */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Pagination
          count={totalPages}
          page={page}
          onChange={(e, v) => setPage(v)}
          color="primary"
        />
      </Box>

      {/* === Recruitment Overview (Appended Section) === */}
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: "#4B49AC", mb: 2 }}
        >
          Recruitment Overview
        </Typography>

        {jobOpenings.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: "center", borderRadius: 3 }}>
            No job openings available.
          </Paper>
        ) : (
          jobOpenings.map((job) => (
            <Box key={job.id} sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: "#4B49AC", mb: 1 }}
              >
                {job.title} — {job.department}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {job.applicants.map((a) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={a.id}>
                    <Paper
                      elevation={3}
                      sx={{
                        borderRadius: 3,
                        p: 2.5,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "space-between",
                        height: 240,
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 8px 24px rgba(75,73,172,0.15)",
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: "#4B49AC",
                          width: 60,
                          height: 60,
                          mb: 1,
                        }}
                      >
                        {getInitials(a.name)}
                      </Avatar>
                      <Typography fontWeight={700} color="#4B49AC">
                        {a.name}
                      </Typography>
                      <Chip
                        label={a.status}
                        color={chipColor(a.status)}
                        size="small"
                        sx={{ my: 1 }}
                      />
                      {a.status === "Pending" ? (
                        <Box sx={{ display: "flex", gap: 1, width: "100%" }}>
                          <Button
                            variant="outlined"
                            color="error"
                            fullWidth
                            size="small"
                            onClick={() => openDecisionDialog(a, "reject")}
                          >
                            Reject
                          </Button>
                          <Button
                            variant="contained"
                            color="success"
                            fullWidth
                            size="small"
                            onClick={() => openDecisionDialog(a, "approve")}
                          >
                            Approve
                          </Button>
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: "center" }}>
                          <Typography variant="body2" color="text.secondary">
                            {a.status === "Approved"
                              ? "Approved ✅"
                              : "Rejected ❌"}
                          </Typography>
                          {a.reason && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Reason: {a.reason}
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        )}
      </Box>

      {/* === Decision Dialog === */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {decisionType === "approve"
            ? "Approve Candidate"
            : "Reject Candidate"}
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
            placeholder="Enter reason..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitDecision}
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
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
