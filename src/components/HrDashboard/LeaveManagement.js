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
import api from "../../AxiosInstance";

const STATUS_COLOR = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  CANCELLED: "default",
};

export default function LeaveManagement() {
  const [pending, setPending] = useState([]);
  const [decided, setDecided] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const { data } = await api.get("/leave/pending");
      setPending(data || []);
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

      setPending((prev) => {
        const found = prev.find((r) => r.id === id);
        if (!found) return prev;
        const updated = { ...found, status: approve ? "APPROVED" : "REJECTED" };
        setDecided((hist) => [updated, ...hist]); // prepend to history
        return prev.filter((r) => r.id !== id); // remove from pending table
      });
    } catch (e) {
      console.error(e);
      alert("Action failed.");
    }
  };

  const renderTable = (rows, editable) => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <strong>Employee</strong>
          </TableCell>
          <TableCell>
            <strong>Type</strong>
          </TableCell>
          <TableCell>
            <strong>Start</strong>
          </TableCell>
          <TableCell>
            <strong>End</strong>
          </TableCell>
          <TableCell>
            <strong>Reason</strong>
          </TableCell>
          <TableCell>
            <strong>Status</strong>
          </TableCell>
          {editable && (
            <TableCell>
              <strong>Actions</strong>
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading && rows === pending && (
          <TableRow>
            <TableCell colSpan={editable ? 7 : 6} align="center">
              Loading…
            </TableCell>
          </TableRow>
        )}

        {!loading && rows.length === 0 && (
          <TableRow>
            <TableCell colSpan={editable ? 7 : 6} align="center">
              {editable
                ? "No pending requests."
                : "No recent decisions in this session."}
            </TableCell>
          </TableRow>
        )}

        {!loading &&
          rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell>{r.employee}</TableCell>
              <TableCell>{r.type}</TableCell>
              <TableCell>{r.start}</TableCell>
              <TableCell>{r.end}</TableCell>
              <TableCell title={r.reason || "—"}>
                <Box
                  sx={{
                    maxWidth: 300,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {r.reason || "—"}
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  label={r.status}
                  color={STATUS_COLOR[r.status] || "default"}
                />
              </TableCell>

              {editable && (
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
              )}
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  return (
    <Stack spacing={4}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5">Leave Management & Approvals</Typography>
          {/* <Button onClick={load} size="small">
            Refresh
          </Button> */}
        </Stack>

        {err && (
          <Typography color="error" sx={{ mb: 2 }}>
            {err}
          </Typography>
        )}

        {/* Pending table (editable) */}
        {renderTable(pending, true)}
      </Paper>

      {/* Recently decided (this session) */}
      {/* <Paper sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h6">Leave History</Typography>
          {decided.length > 0 && (
            <Button size="small" onClick={() => setDecided([])}>
              Clear
            </Button>
          )}
        </Stack>
        {renderTable(decided, false)}
      </Paper> */}
    </Stack>
  );
}
