// src/components/DirectorDashboard/PolicyOversight.js
import React, { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Paper, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Chip, Stack, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

export default function PolicyOversight() {
  const [allPolicies, setAllPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const load = async () => {
    try {
      const { data } = await axiosInstance.get("http://localhost:8080/policies");
      setAllPolicies(data);
    } catch (e) {
      setSnack({ open: true, msg: "Failed to load policies", sev: "error" });
    }
  };

  useEffect(() => { load(); }, []);

  const decide = async (id, approve) => {
    try {
      await axiosInstance.patch(`http://localhost:8080/policies/${id}?approve=${approve}`);
      // Optimistic local update so the row moves to the decided table immediately
      setAllPolicies(prev =>
        prev.map(p => p.id === id ? { ...p, status: approve ? "APPROVED" : "REJECTED" } : p)
      );
      setSnack({ open: true, msg: approve ? "Approved." : "Rejected.", sev: "success" });
    } catch (e) {
      setSnack({ open: true, msg: "Failed to submit decision", sev: "error" });
    }
  };

  const chipColor = (s) =>
    s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

  const filteredTop = useMemo(() => {
    return statusFilter ? allPolicies.filter(p => p.status === statusFilter) : allPolicies;
  }, [allPolicies, statusFilter]);

  const decided = useMemo(() => {
    return allPolicies.filter(p => p.status !== "PENDING");
  }, [allPolicies]);

  return (
    <Box>
      {/* Header + filter */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Policy Oversight</Typography>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Top table (filtered, usually Pending) */}
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
              <TableRow><TableCell colSpan={5} align="center">No policies</TableCell></TableRow>
            ) : (
              filteredTop.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.title}</TableCell>
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
                    ) : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Bottom table: decided items stay visible here */}
      <Typography variant="h6" sx={{ mb: 1 }}>Decided Policies</Typography>
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
              <TableRow><TableCell colSpan={4} align="center">None yet</TableCell></TableRow>
            ) : (
              decided.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.title}</TableCell>
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

      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.sev} onClose={() => setSnack({ ...snack, open: false })}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}