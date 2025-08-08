// src/components/DirectorDashboard/PolicyOversight.js
import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

export default function PolicyOversight() {
  const [allPolicies, setAllPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  // details dialog
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const load = async () => {
    try {
      const { data } = await axiosInstance.get("http://localhost:8080/policies");
      setAllPolicies(data);
    } catch {
      setSnack({ open: true, msg: "Failed to load policies", sev: "error" });
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, approve) => {
    try {
      await axiosInstance.patch(
        `http://localhost:8080/policies/${id}?approve=${approve}`
      );
      // optimistic update
      setAllPolicies((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: approve ? "APPROVED" : "REJECTED" } : p
        )
      );
      setSnack({
        open: true,
        msg: approve ? "Approved." : "Rejected.",
        sev: "success",
      });
    } catch {
      setSnack({ open: true, msg: "Failed to submit decision", sev: "error" });
    }
  };

  const chipColor = (s) =>
    s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

  const filteredTop = useMemo(() => {
    return statusFilter
      ? allPolicies.filter((p) => p.status === statusFilter)
      : allPolicies;
  }, [allPolicies, statusFilter]);

  const decided = useMemo(
    () => allPolicies.filter((p) => p.status !== "PENDING"),
    [allPolicies]
  );

  const openDetails = async (id) => {
    try {
      const { data } = await axiosInstance.get(
        `http://localhost:8080/policies/${id}`
      );
      setSelectedPolicy(data);
    } catch {
      setSnack({ open: true, msg: "Failed to load policy details", sev: "error" });
    }
  };
  const closeDetails = () => setSelectedPolicy(null);

  // Common cell style for clickable titles (no link look)
  const titleCellSx = {
    cursor: "pointer",
    "&:hover": { backgroundColor: "action.hover" },
  };

  return (
    <Box>
      {/* Header + filter */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Policy Oversight</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
  <InputLabel id="policy-status-label" shrink>
    Status
  </InputLabel>
  <Select
    labelId="policy-status-label"
    id="policy-status"
    value={statusFilter}
    label="Status"
    onChange={(e) => setStatusFilter(e.target.value)}
    displayEmpty
    renderValue={(val) => (val === "" ? "All" : val)}
  >
    <MenuItem value="">All</MenuItem>
    <MenuItem value="PENDING">Pending</MenuItem>
    <MenuItem value="APPROVED">Approved</MenuItem>
    <MenuItem value="REJECTED">Rejected</MenuItem>
  </Select>
</FormControl>
      </Stack>

      {/* Top table (filtered) */}
      <Paper sx={{ mb: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Effective Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTop.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">No policies</TableCell>
              </TableRow>
            ) : (
              filteredTop.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell sx={titleCellSx} onClick={() => openDetails(p.id)}>
                    {p.title}
                  </TableCell>
                  <TableCell>{p.effectiveDate}</TableCell>
                  <TableCell>
                    <Chip label={p.status} color={chipColor(p.status)} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {p.status === "PENDING" ? (
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(p.id, false);
                          }}
                        >
                          Reject
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={(e) => {
                            e.stopPropagation();
                            decide(p.id, true);
                          }}
                        >
                          Approve
                        </Button>
                      </Stack>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Bottom table: decided items stay visible here */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Decided Policies
      </Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Effective Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {decided.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">None yet</TableCell>
              </TableRow>
            ) : (
              decided.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell sx={titleCellSx} onClick={() => openDetails(p.id)}>
                    {p.title}
                  </TableCell>
                  <TableCell>{p.effectiveDate}</TableCell>
                  <TableCell>
                    <Chip label={p.status} color={chipColor(p.status)} size="small" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Details dialog */}
      {selectedPolicy && (
        <Dialog open onClose={closeDetails} fullWidth maxWidth="sm">
          <DialogTitle>Policy Details</DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1">
              <strong>Title:</strong> {selectedPolicy.title}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              <strong>Description:</strong>
            </Typography>
            <Typography paragraph>{selectedPolicy.description}</Typography>
            <Typography><strong>Status:</strong> {selectedPolicy.status}</Typography>
            <Typography>
              <strong>Effective Date:</strong> {selectedPolicy.effectiveDate || "N/A"}
            </Typography>
            <Typography><strong>Created By:</strong> {selectedPolicy.createdBy}</Typography>
            {selectedPolicy.decidedBy && (
              <>
                <Typography><strong>Decided By:</strong> {selectedPolicy.decidedBy}</Typography>
                <Typography>
                  <strong>Decided At:</strong>{" "}
                  {selectedPolicy.decidedAt?.replace("T", " ").slice(0, 16)}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDetails}>Close</Button>
          </DialogActions>
        </Dialog>
      )}

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
