import React, { useMemo, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  Autocomplete,
} from "@mui/material";
import dayjs from "dayjs";

// UI-only attendance info for a profile page.
// Props:
// - employeeName (optional): if provided the component will show data for that employee
// - records (optional): an array of attendance records to use; if absent a small mock dataset is used for UI preview
export default function AttendanceInfo({
  employeeName: propEmployeeName = null,
  records: propRecords = null,
}) {
  // months list (last 6 months)
  const months = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push(d.toISOString().slice(0, 7));
    }
    return out;
  }, []);

  // If records not provided, generate a small mock dataset for the UI only
  const generateMockRecords = () => {
    const names = ["John Doe", "Jane Smith", "Alex Brown", "Emma Johnson"];
    const depts = ["IT", "HR", "Academic", "Admin"];
    const arr = [];
    let idCounter = 1;
    for (let d = 1; d <= 20; d++) {
      const date = `2025-11-${String(d).padStart(2, "0")}`;
      for (let i = 0; i < names.length; i++) {
        const n = names[i];
        const rand = Math.random();
        let status = "Present";
        if (rand > 0.95) status = "On Leave";
        else if (rand > 0.9) status = "Absent";
        else if (rand > 0.85) status = "Late";
        const checkIn =
          status === "Present" || status === "Late"
            ? `08:${30 + (i % 30)}`
            : "-";
        const checkOut =
          status === "Present" || status === "Late"
            ? `16:${10 + (i % 40)}`
            : "-";
        arr.push({
          id: idCounter,
          name: n,
          department: depts[i % depts.length],
          date,
          checkIn,
          checkOut,
          status,
        });
        idCounter++;
      }
    }
    return arr;
  };

  const records = propRecords || generateMockRecords();

  // list of employees (used by the Autocomplete selector)
  const employees = useMemo(
    () => Array.from(new Set(records.map((r) => r.name))).sort(),
    [records]
  );

  // selected employee (defaults to profile-provided name when available)
  const [selectedEmployee, setSelectedEmployee] = useState(
    propEmployeeName || null
  );
  const [subTab, setSubTab] = useState(0);
  const [summaryMonth, setSummaryMonth] = useState(
    months[0] || dayjs().format("YYYY-MM")
  );
  const [viewMode, setViewMode] = useState("monthly");

  const [empPage, setEmpPage] = useState(0);
  const [empRowsPerPage, setEmpRowsPerPage] = useState(10);

  // status color helper (UI only)
  const getStatusColor = (status) => {
    switch (status) {
      case "Present":
        return "#4B49AC";
      case "Absent":
        return "#F3797E";
      case "On Leave":
        return "#7DA0FA";
      case "Late":
        return "#F4C430";
      default:
        return "#999";
    }
  };

  // records for selected employee
  const employeeFilteredRecords = useMemo(() => {
    if (!selectedEmployee) return [];
    return records
      .filter((r) => r.name === selectedEmployee)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [records, selectedEmployee]);

  // summary metrics for the selected employee and selected month
  const summaryMetrics = useMemo(() => {
    if (!selectedEmployee)
      return {
        totalWorkingDays: 0,
        presentDays: 0,
        absentDays: 0,
        leavesTaken: 0,
        lateCount: 0,
        attendancePct: 0,
        avgHoursPerDay: 0,
      };
    const monthStart = dayjs(summaryMonth + "-01");
    const daysInMonth = monthStart.daysInMonth();
    let totalWorkingDays = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const day = monthStart.date(d);
      const wd = day.day();
      if (wd !== 0 && wd !== 6) totalWorkingDays++;
    }

    const recordsInMonth = records.filter(
      (r) =>
        r.name === selectedEmployee &&
        dayjs(r.date).format("YYYY-MM") === summaryMonth
    );
    const presentDays = recordsInMonth.filter(
      (r) => r.status === "Present"
    ).length;
    const absentDays = recordsInMonth.filter(
      (r) => r.status === "Absent"
    ).length;
    const leavesTaken = recordsInMonth.filter(
      (r) => r.status === "On Leave"
    ).length;
    const lateCount = recordsInMonth.filter((r) => r.status === "Late").length;
    const attendancePct = totalWorkingDays
      ? Math.round((presentDays / totalWorkingDays) * 1000) / 10
      : 0;

    // average hours per day (simple parsing of checkIn/checkOut)
    let totalMinutes = 0;
    let countDays = 0;
    recordsInMonth.forEach((r) => {
      if (r.checkIn && r.checkOut && r.checkIn !== "-" && r.checkOut !== "-") {
        const a = r.checkIn.split(":").map(Number);
        const b = r.checkOut.split(":").map(Number);
        if (a.length === 2 && b.length === 2) {
          const mins = b[0] * 60 + b[1] - (a[0] * 60 + a[1]);
          if (!isNaN(mins) && mins > 0) {
            totalMinutes += mins;
            countDays++;
          }
        }
      }
    });
    const avgHoursPerDay = countDays
      ? Math.round((totalMinutes / countDays / 60) * 10) / 10
      : 0;

    return {
      totalWorkingDays,
      presentDays,
      absentDays,
      leavesTaken,
      lateCount,
      attendancePct,
      avgHoursPerDay,
    };
  }, [records, selectedEmployee, summaryMonth]);

  // calendar grouping for the summary month
  const weeklyGroups = useMemo(() => {
    const monthStart = dayjs(summaryMonth + "-01");
    const daysInMonth = monthStart.daysInMonth();
    const firstDay = monthStart.day();
    const offset = (firstDay + 6) % 7; // align Monday
    const cells = [];
    for (let i = 0; i < offset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = monthStart.date(d);
      cells.push({ day: dt.format("ddd"), dateStr: dt.format("YYYY-MM-DD") });
    }
    while (cells.length % 7 !== 0) cells.push(null);
    const groups = [];
    for (let i = 0; i < cells.length; i += 7)
      groups.push(cells.slice(i, i + 7));
    return groups;
  }, [summaryMonth]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Attendance Summary
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={employees}
              value={selectedEmployee}
              onChange={(_, newVal) => {
                setSelectedEmployee(newVal || null);
                setEmpPage(0);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select employee"
                  size="small"
                  fullWidth
                />
              )}
              disabled={!!propEmployeeName}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedEmployee(propEmployeeName || null);
                  setEmpPage(0);
                }}
              >
                Reset
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {!selectedEmployee ? (
        <Paper sx={{ p: 2 }}>
          <Typography>
            Select an employee to view their attendance summaries.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={subTab} onChange={(_, v) => setSubTab(v)}>
              <Tab label="Attendance Records" />
              <Tab label="Attendance Summaries" />
              <Tab label="Monthly / Weekly View" />
            </Tabs>
          </Box>

          {subTab === 0 && (
            <Paper sx={{ borderRadius: 2, p: 1, mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Check-In</TableCell>
                    <TableCell>Check-Out</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employeeFilteredRecords
                    .slice(
                      empPage * empRowsPerPage,
                      empPage * empRowsPerPage + empRowsPerPage
                    )
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.date}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.checkIn}</TableCell>
                        <TableCell>{r.checkOut}</TableCell>
                        <TableCell>
                          <Typography
                            sx={{
                              fontWeight: 600,
                              color: getStatusColor(r.status),
                            }}
                          >
                            {r.status}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={employeeFilteredRecords.length}
                page={empPage}
                onPageChange={(e, newPage) => setEmpPage(newPage)}
                rowsPerPage={empRowsPerPage}
                onRowsPerPageChange={(e) => {
                  setEmpRowsPerPage(parseInt(e.target.value, 10));
                  setEmpPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </Paper>
          )}

          {subTab === 1 && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={summaryMonth}
                      label="Month"
                      onChange={(e) => setSummaryMonth(e.target.value)}
                    >
                      {months.map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Total working days
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {summaryMetrics.totalWorkingDays}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Present days
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {summaryMetrics.presentDays}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Absent days
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {summaryMetrics.absentDays}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Leaves taken
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {summaryMetrics.leavesTaken}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Late arrivals
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {summaryMetrics.lateCount}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Attendance %
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {summaryMetrics.attendancePct}%
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      Avg working hours / day
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {summaryMetrics.avgHoursPerDay} hrs
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {subTab === 2 && (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <FormControl size="small" sx={{ minWidth: 160 }}>
                  <InputLabel>Month</InputLabel>
                  <Select
                    value={summaryMonth}
                    label="Month"
                    onChange={(e) => setSummaryMonth(e.target.value)}
                  >
                    {months.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box>
                  <Button
                    variant={viewMode === "monthly" ? "contained" : "outlined"}
                    onClick={() => setViewMode("monthly")}
                    sx={{ mr: 1 }}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={viewMode === "weekly" ? "contained" : "outlined"}
                    onClick={() => setViewMode("weekly")}
                  >
                    Weekly
                  </Button>
                </Box>
              </Box>

              {viewMode === "monthly" ? (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    {summaryMonth} - Calendar
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (h) => (
                        <Box key={h} sx={{ p: 1, textAlign: "center" }}>
                          <Typography variant="caption" color="text.secondary">
                            {h}
                          </Typography>
                        </Box>
                      )
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(7, 1fr)",
                      gap: 1,
                    }}
                  >
                    {weeklyGroups.flat().map((cell, idx) => {
                      if (!cell)
                        return (
                          <Box
                            key={idx}
                            sx={{
                              p: 1,
                              minHeight: 80,
                              background: "#f8f9fb",
                              borderRadius: 1,
                            }}
                          />
                        );
                      const rec = employeeFilteredRecords.find(
                        (r) => r.date === cell.dateStr
                      );
                      const bg = rec ? getStatusColor(rec.status) : "#f8f9fb";
                      return (
                        <Box
                          key={cell.dateStr}
                          title={
                            rec
                              ? `${cell.dateStr} - ${rec.status}`
                              : cell.dateStr
                          }
                          sx={{
                            p: 1,
                            minHeight: 80,
                            background: bg,
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="caption">{cell.day}</Typography>
                          <Typography variant="body2">
                            {cell.dateStr}
                          </Typography>
                          {rec && (
                            <Typography variant="caption">
                              {rec.status}
                            </Typography>
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              ) : (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Weekly View
                  </Typography>
                  <Grid container spacing={1}>
                    {weeklyGroups.map((week, idx) => (
                      <Grid item xs={12} key={idx}>
                        <Paper sx={{ p: 1 }}>
                          <Typography variant="caption">
                            Week {idx + 1}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                            {week.map((cell, i) => {
                              if (!cell)
                                return (
                                  <Box
                                    key={i}
                                    sx={{
                                      p: 1,
                                      minWidth: 80,
                                      background: "#f8f9fb",
                                      borderRadius: 1,
                                    }}
                                  />
                                );
                              const rec = employeeFilteredRecords.find(
                                (r) => r.date === cell.dateStr
                              );
                              const bg = rec
                                ? getStatusColor(rec.status)
                                : "#f8f9fb";
                              return (
                                <Box
                                  key={cell.dateStr}
                                  sx={{
                                    p: 1,
                                    minWidth: 80,
                                    background: bg,
                                    borderRadius: 1,
                                  }}
                                  title={
                                    rec
                                      ? `${cell.dateStr} - ${rec.status}`
                                      : cell.dateStr
                                  }
                                >
                                  <Typography variant="caption">
                                    {cell.day}
                                  </Typography>
                                  <Typography variant="body2">
                                    {cell.dateStr}
                                  </Typography>
                                  {rec && (
                                    <Typography variant="caption">
                                      {rec.status}
                                    </Typography>
                                  )}
                                </Box>
                              );
                            })}
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}
