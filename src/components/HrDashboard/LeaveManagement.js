// src/components/HrDashboard/LeaveManagement.js
import React, { useState } from "react";
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
} from "@mui/material";

const initialLeaveRequests = [
  {
    id: 1,
    employee: "Inzam Shahib",
    date: "2025-07-30",
    reason: "Medical",
    status: "Pending",
  },
  {
    id: 2,
    employee: "Ayesha N.",
    date: "2025-08-01",
    reason: "Personal",
    status: "Pending",
  },
];

const LeaveManagement = () => {
  const [requests, setRequests] = useState(initialLeaveRequests);

  const updateStatus = (id, newStatus) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Leave Management & Approvals
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Employee</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Reason</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell>{req.employee}</TableCell>
              <TableCell>{req.date}</TableCell>
              <TableCell>{req.reason}</TableCell>
              <TableCell>
                <Chip
                  label={req.status}
                  color={
                    req.status === "Approved"
                      ? "success"
                      : req.status === "Rejected"
                      ? "error"
                      : "warning"
                  }
                />
              </TableCell>
              <TableCell>
                {req.status === "Pending" && (
                  <>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={() => updateStatus(req.id, "Approved")}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      onClick={() => updateStatus(req.id, "Rejected")}
                    >
                      Reject
                    </Button>
                  </>
                )}
                {req.status !== "Pending" && <Typography>No action</Typography>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default LeaveManagement;
