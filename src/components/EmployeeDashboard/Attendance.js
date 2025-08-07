// src/components/EmployeeDashboard/Attendance.js
import React from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";

const Attendance = () => {
  // Dummy attendance records
  const attendanceRecords = [
    { date: "2025-07-01", checkIn: "08:30", checkOut: "17:00", status: "Present" },
    { date: "2025-07-02", checkIn: "08:45", checkOut: "16:50", status: "Present" },
    { date: "2025-07-03", checkIn: "-", checkOut: "-", status: "Absent" },
    { date: "2025-07-04", checkIn: "08:40", checkOut: "17:10", status: "Present" },
  ];

  return (
    <Paper sx={{ p: 3, maxWidth: 800 }}>
      <Typography variant="h6" gutterBottom>
        Attendance Records
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Check-In Time</TableCell>
              <TableCell>Check-Out Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attendanceRecords.map(({ date, checkIn, checkOut, status }) => (
              <TableRow key={date}>
                <TableCell>{date}</TableCell>
                <TableCell>{checkIn}</TableCell>
                <TableCell>{checkOut}</TableCell>
                <TableCell>{status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default Attendance;
