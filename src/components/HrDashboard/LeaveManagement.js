// src/components/HrDashboard/LeaveManagement.js
import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  Stack,
} from "@mui/material";
import api from "../../AxiosInstance"; // if this path 404s, use "../../../AxiosInstance"

const STATUS_COLOR = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "default",
};

export default function LeaveManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await api.get("/leave/pending"); // HR/ADMIN only
      setRows(data); // [{id, employee, type, start, end, status}]
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.status === 403
          ? "Forbidden (need HR or Admin role)."
          : "Failed to load leave requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const decide = async (id, approve) => {
    try {
      await api.patch(`/leave/${id}`, null, { params: { approve } });
      // Optimistic update; or call load() again
      setRows((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: approve ? "APPROVED" : "REJECTED" } : r
        )
      );
    } catch (e) {
      console.error(e);
      alert("Action failed.");
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Leave Management & Approvals</Typography>
        <Button onClick={load} size="small">Refresh</Button>
      </Stack>

      {err && (
        <Typography color="error" sx={{ mb: 2 }}>
          {err}
        </Typography>
      )}

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Employee</strong></TableCell>
            <TableCell><strong>Type</strong></TableCell>
            <TableCell><strong>Start</strong></TableCell>
            <TableCell><strong>End</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading && (
            <TableRow>
              <TableCell colSpan={6} align="center">Loading…</TableCell>
            </TableRow>
          )}

          {!loading && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center">No pending requests.</TableCell>
            </TableRow>
          )}

          {!loading &&
            rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.employee}</TableCell>
                <TableCell>{r.type}</TableCell>
                <TableCell>{r.start}</TableCell>
                <TableCell>{r.end}</TableCell>
                <TableCell>
                  <Chip label={r.status} color={STATUS_COLOR[r.status] || "default"} />
                </TableCell>
                <TableCell>
                  {r.status === "PENDING" ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => decide(r.id, true)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => decide(r.id, false)}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No action
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
