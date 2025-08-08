// src/components/EmployeeDashboard/Leave.js
import React, { useEffect, useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableHead, TableRow,
  TableContainer, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, MenuItem, Snackbar, Alert, Chip, Box, Stack
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

const leaveTypes = [
  { label: "Annual Leave", value: "ANNUAL" },
  { label: "Sick Leave",   value: "SICK"   },
  { label: "Casual Leave", value: "CASUAL" },
];

const statusColor = (s) =>
  s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newLeave, setNewLeave] = useState({ type: "", startDate: "", endDate: "", reason: "" });
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "success" });

  useEffect(() => {
    loadBalances();
    loadMyLeaves();
  }, []);

  const loadBalances = async () => {
    try {
      const { data } = await axiosInstance.get("http://localhost:8080/leave/balance");
      setBalances(data || []);
    } catch {
      setSnack({ open: true, msg: "Failed to load leave balances", severity: "error" });
    }
  };

  const loadMyLeaves = async () => {
    try {
      const { data } = await axiosInstance.get("http://localhost:8080/leave/my");
      // backend returns {id,type,start,end,status,reason}
      setLeaves(data || []);
    } catch {
      setLeaves([]);
    }
  };

  const handleChange = (e) => setNewLeave(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate) return;
    try {
      setSubmitting(true);
      await axiosInstance.post("http://localhost:8080/leave", {
        startDate: newLeave.startDate,
        endDate:   newLeave.endDate,
        type:      newLeave.type,
        reason:    newLeave.reason?.trim() || null,
      });
      setSnack({ open: true, msg: "Leave application submitted", severity: "success" });
      setOpen(false);
      setNewLeave({ type: "", startDate: "", endDate: "", reason: "" });
      await loadBalances();
      await loadMyLeaves(); // show the real row from server
    } catch (e) {
      setSnack({ open: true, msg: "Failed to submit leave", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 900 }}>
      <Typography variant="h6" gutterBottom>Leave Management</Typography>

      {/* show ALL types (service pads missing ones with zeros) */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {balances.map(b => (
          <Chip key={b.type} label={`${b.type}: ${b.remaining} / ${b.entitled} remaining`} />
        ))}
      </Stack>

      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>
        Apply for Leave
      </Button>

      <TableContainer>
        <Table>
  <TableHead>
    <TableRow>
      <TableCell>Leave Type</TableCell>
      <TableCell>Start Date</TableCell>
      <TableCell>End Date</TableCell>
      <TableCell>Reason</TableCell> {/* NEW */}
      <TableCell>Status</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {leaves.length === 0 ? (
      <TableRow>
        <TableCell colSpan={5} align="center">No leave applications yet.</TableCell>
      </TableRow>
    ) : (
      leaves.map(row => (
        <TableRow key={row.id}>
          <TableCell>{row.type}</TableCell>
          <TableCell>{row.start}</TableCell>
          <TableCell>{row.end}</TableCell>
          <TableCell title={row.reason || "—"}>
            <Box sx={{ maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {row.reason || "—"}
            </Box>
          </TableCell>
          <TableCell>
            <Chip size="small" label={row.status} color={statusColor(row.status)} />
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>

      </TableContainer>

      {/* Apply dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent>
          <TextField
            select label="Leave Type" name="type" value={newLeave.type}
            onChange={handleChange} fullWidth margin="normal" required
          >
            {leaveTypes.map(t => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
          </TextField>

          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField label="Start Date" type="date" name="startDate"
              value={newLeave.startDate} onChange={handleChange}
              InputLabelProps={{ shrink: true }} required />
            <TextField label="End Date" type="date" name="endDate"
              value={newLeave.endDate} onChange={handleChange}
              InputLabelProps={{ shrink: true }} required />
          </Box>

          <TextField
            label="Reason (optional)" name="reason" value={newLeave.reason}
            onChange={handleChange} fullWidth margin="normal" multiline rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} sx={{ width: "100%" }}>{snack.msg}</Alert>
      </Snackbar>
    </Paper>
  );
}
