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
  Select,
  MenuItem,
} from "@mui/material";

const initialAttendance = [
  { id: 1, name: "Inzam Shahib", date: "2025-07-29", status: "Present" },
  { id: 2, name: "Ayesha N.", date: "2025-07-29", status: "Absent" },
  { id: 3, name: "Sajith R.", date: "2025-07-29", status: "Late" },
];

const AttendanceTracking = () => {
  const [attendance, setAttendance] = useState(initialAttendance);

  const handleChange = (id, newStatus) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.id === id ? { ...record, status: newStatus } : record
      )
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Attendance Tracking
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Employee</strong></TableCell>
            <TableCell><strong>Date</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {attendance.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.name}</TableCell>
              <TableCell>{record.date}</TableCell>
              <TableCell>
                <Select
                  value={record.status}
                  onChange={(e) => handleChange(record.id, e.target.value)}
                  size="small"
                >
                  <MenuItem value="Present">Present</MenuItem>
                  <MenuItem value="Absent">Absent</MenuItem>
                  <MenuItem value="Late">Late</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default AttendanceTracking;
