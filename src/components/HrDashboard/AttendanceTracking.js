import React, { useState, useEffect } from "react";
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
  TextField,
  Grid,
  Avatar,
  CircularProgress,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";
import dayjs from "dayjs";

const AttendanceTracking = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendanceData();
    }
  }, [selectedEmployee, selectedMonth]);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get("/hr/employees");
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/attendance/${selectedEmployee}`,
        {
          params: { month: selectedMonth },
        }
      );
      setAttendanceRecords(response.data);
      calculateSummary(response.data);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (records) => {
    const presentDays = records.filter((r) => r.paidMinutes > 0).length;
    const absentDays = records.filter((r) => !r.firstIn && !r.lastOut).length;
    const totalPaidMinutes = records.reduce((sum, r) => sum + r.paidMinutes, 0);
    const avgWorkingMinutes = presentDays
      ? Math.round(totalPaidMinutes / presentDays)
      : 0;

    setSummary({
      presentDays,
      absentDays,
      totalPaidMinutes,
      avgWorkingMinutes,
    });
  };

  const formatTime = (datetime) => {
    if (!datetime) return "-";
    return dayjs(datetime).format("hh:mm A");
  };

  const formatDate = (date) => {
    return dayjs(date).format("MMM D, YYYY");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Attendance Tracking (HR View)
      </Typography>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Select
              fullWidth
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              displayEmpty
            >
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map((emp) => (
                <MenuItem key={emp.id} value={emp.id}>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item>
                      <Avatar alt={emp.fullName} src={emp.avatarUrl} />
                    </Grid>
                    <Grid item>
                      {emp.fullName} ({emp.staffID})
                    </Grid>
                  </Grid>
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Select Month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Summary Panel */}
          {summary && (
            <Paper sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1">Monthly Summary</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  Present Days: {summary.presentDays}
                </Grid>
                <Grid item xs={12} sm={3}>
                  Absent Days: {summary.absentDays}
                </Grid>
                <Grid item xs={12} sm={3}>
                  Total Paid Hours: {(summary.totalPaidMinutes / 60).toFixed(1)}{" "}
                  hrs
                </Grid>
                <Grid item xs={12} sm={3}>
                  Avg Daily Hours: {(summary.avgWorkingMinutes / 60).toFixed(1)}{" "}
                  hrs
                </Grid>
              </Grid>
            </Paper>
          )}

          {/* Attendance Table */}
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>First In</TableCell>
                  <TableCell>Last Out</TableCell>
                  <TableCell>Break (min)</TableCell>
                  <TableCell>Paid (min)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((rec) => (
                  <TableRow key={rec.workDate}>
                    <TableCell>{formatDate(rec.workDate)}</TableCell>
                    <TableCell>{formatTime(rec.firstIn)}</TableCell>
                    <TableCell>{formatTime(rec.lastOut)}</TableCell>
                    <TableCell>{rec.breakMinutes}</TableCell>
                    <TableCell>{rec.paidMinutes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default AttendanceTracking;
