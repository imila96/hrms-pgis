// src/components/DirectorDashboard/PolicyOversight.js
import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Button,
  Chip,
  Stack,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TableContainer,
  TablePagination,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Refresh } from "@mui/icons-material";

export default function PolicyOversight() {
  const [policies, setPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // === Fetch policies ===
  const loadPolicies = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("http://localhost:8080/policies");
      setPolicies(data);
    } catch {
      setSnack({ open: true, msg: "Failed to load policies", sev: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  // === Approve / Reject ===
  const decide = async (id, approve) => {
    try {
      await axiosInstance.patch(
        `http://localhost:8080/policies/${id}?approve=${approve}`
      );
      setPolicies((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, status: approve ? "APPROVED" : "REJECTED" }
            : p
        )
      );
      setSnack({
        open: true,
        msg: approve ? "Policy Approved" : "Policy Rejected",
        sev: "success",
      });
    } catch {
      setSnack({ open: true, msg: "Failed to submit decision", sev: "error" });
    }
  };

  const chipColor = (s) =>
    s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

  // === Filter + Search ===
  const filtered = useMemo(() => {
    let data = [...policies];
    if (statusFilter !== "All")
      data = data.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.id?.toString().toLowerCase().includes(q)
      );
    }
    return data;
  }, [policies, statusFilter, search]);

  // === Summary Cards ===
  const summary = useMemo(() => {
    const total = policies.length;
    const pending = policies.filter((p) => p.status === "PENDING").length;
    const approved = policies.filter((p) => p.status === "APPROVED").length;
    const rejected = policies.filter((p) => p.status === "REJECTED").length;
    return { total, pending, approved, rejected };
  }, [policies]);

  // === Details Dialog ===
  const openDetails = async (id) => {
    try {
      const { data } = await axiosInstance.get(
        `http://localhost:8080/policies/${id}`
      );
      setSelectedPolicy(data);
    } catch {
      setSnack({
        open: true,
        msg: "Failed to load policy details",
        sev: "error",
      });
    }
  };
  const closeDetails = () => setSelectedPolicy(null);

  // === Export PDF ===
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "Title", "Effective Date", "Status"]],
      body: filtered.map((p) => [
        p.id,
        p.title,
        p.effectiveDate || "—",
        p.status,
      ]),
    });
    doc.save("policies.pdf");
  };

  // === Snackbar Close ===
  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  return (
    <Box sx={{ p: 3 }}>
      {/* === Header === */}
      <Typography variant="h5" gutterBottom>
        Policy Oversight
      </Typography>

      {/* === Summary Cards === */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total Policies", value: summary.total, color: "#4B49AC" },
          { label: "Pending", value: summary.pending, color: "#7DA0FA" },
          { label: "Approved", value: summary.approved, color: "#4CAF50" },
          { label: "Rejected", value: summary.rejected, color: "#F3797E" },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                background: card.color,
                color: "#fff",
              }}
            >
              <Typography variant="caption">{card.label}</Typography>
              <Typography variant="h4" fontWeight={700}>
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* === Filters Toolbar === */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by title or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4} textAlign="right">
            <Button
              startIcon={<Refresh />}
              variant="outlined"
              sx={{
                mr: 1,
                textTransform: "none",
                borderColor: "#4B49AC",
                color: "#4B49AC",
              }}
              onClick={loadPolicies}
              disabled={loading}
            >
              {loading ? "Loading..." : "Reload"}
            </Button>
            <Button
              startIcon={<Download />}
              variant="contained"
              onClick={exportPDF}
              sx={{
                backgroundColor: "#4B49AC",
                textTransform: "none",
                "&:hover": { backgroundColor: "#7DA0FA" },
              }}
            >
              Export PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* === Policy Table === */}
      <Paper sx={{ p: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Effective Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.id}</TableCell>
                    <TableCell
                      sx={{
                        cursor: "pointer",
                        "&:hover": { textDecoration: "underline" },
                      }}
                      onClick={() => openDetails(p.id)}
                    >
                      {p.title}
                    </TableCell>
                    <TableCell>{p.effectiveDate || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        color={chipColor(p.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {p.status === "PENDING" ? (
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            onClick={() => decide(p.id, false)}
                          >
                            Reject
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => decide(p.id, true)}
                          >
                            Approve
                          </Button>
                        </Stack>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No policies found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* === Details Dialog === */}
      {selectedPolicy && (
        <Dialog open onClose={closeDetails} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{
              backgroundColor: "#4B49AC",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Policy Details
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" fontWeight={600}>
              Title: {selectedPolicy.title}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Description:</strong> {selectedPolicy.description}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Status:</strong> {selectedPolicy.status}
            </Typography>
            <Typography>
              <strong>Effective Date:</strong>{" "}
              {selectedPolicy.effectiveDate || "N/A"}
            </Typography>
            <Typography>
              <strong>Created By:</strong> {selectedPolicy.createdBy}
            </Typography>
            {selectedPolicy.decidedBy && (
              <>
                <Typography>
                  <strong>Decided By:</strong> {selectedPolicy.decidedBy}
                </Typography>
                <Typography>
                  <strong>Decided At:</strong>{" "}
                  {selectedPolicy.decidedAt?.replace("T", " ").slice(0, 16) ||
                    "N/A"}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

      {/* === Snackbar === */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={closeSnack}
      >
        <Alert severity={snack.sev} onClose={closeSnack}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
