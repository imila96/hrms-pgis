import React, { useMemo, useState, useEffect } from "react";
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
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  TablePagination,
  InputAdornment,
  Autocomplete,
} from "@mui/material";
import {
  Edit as EditIcon,
  Download as DownloadIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import axiosInstance from "../../AxiosInstance";

const DEPARTMENTS = [
  "General Administration Division",
  "Finance Administration Division",
  "IT & Technical Support Unit",
  "Maintenance & Facilities Unit",
  "Biochemistry and Molecular Biology",
  "Biomedical Sciences",
  "Chemical Sciences",
  "Earth Sciences",
  "Environmental Science",
  "Mathematics",
  "Physics",
  "Plant Sciences",
  "Science Education",
  "Statistics and Computer Science",
  "Zoological Sciences",
  "Human Resources",
  "other",
];
export default function AttendanceTracking() {
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
  });

  const cardSx = {
    p: 2,
    borderRadius: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: 100,
  };
  // available months for selection in the chart (YYYY-MM), from Jan of current year to current month
  const months = useMemo(() => {
    const out = [];
    const now = new Date();
    const year = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12
    for (let m = 1; m <= currentMonth; m++) {
      const mm = String(m).padStart(2, "0");
      out.push(`${year}-${mm}`);
    }
    return out;
  }, []);
  // selected month for the main chart
  const [chartMonth, setChartMonth] = useState(
    months[months.length - 1] || dayjs().format("YYYY-MM")
  );

  // Employee datasets and loading flags
  const [fetchedEmployees, setFetchedEmployees] = useState([]); // full employee list
  const [employeeAttendanceRecords, setEmployeeAttendanceRecords] = useState(
    []
  );
  const [empLoading, setEmpLoading] = useState(false);
  const [attendanceState, setAttendanceState] = useState(null);

  const [monthlyData, setMonthlyData] = useState([]);

  // --- Daily / Employee attendance records section state ---
  const [recordsTab, setRecordsTab] = useState(0);

  const statuses = ["Present", "Absent", "On Leave", "Late"]; // allowed status labels

  const [records, setRecords] = useState([]);

  const [selectedDept, setSelectedDept] = useState("All");
  // show all records by default on page load
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setSelectedRecord(null);
    setOpenEdit(false);
  };
  const handleSaveEdit = () => {
    // perform backend update and refresh local row
    (async () => {
      try {
        // ensure we have an employeeId on the record
        const empId = selectedRecord?.employeeId;
        if (!empId) {
          // fallback: try to resolve by name (best effort)
          const emp = fetchedEmployees.find(
            (e) => e.name === selectedRecord?.name
          );
          if (emp) {
            // try update using resolved id
            await axiosInstance.put(`/attendance/${emp.id}/record`, {
              date: selectedRecord.date,
              checkIn: selectedRecord.checkIn,
              checkOut: selectedRecord.checkOut,
              status: selectedRecord.status,
            });
          } else {
            console.warn(
              "No employeeId available for edit; skipping backend update"
            );
          }
        } else {
          await axiosInstance.put(`/attendance/${empId}/record`, {
            date: selectedRecord.date,
            checkIn: selectedRecord.checkIn,
            checkOut: selectedRecord.checkOut,
            status: selectedRecord.status,
          });
        }

        // optimistic local update
        setRecords((prev) =>
          prev.map((r) => (r.id === selectedRecord.id ? selectedRecord : r))
        );
        setOpenEdit(false);
      } catch (err) {
        console.error("Failed to save edit", err);
      }
    })();
  };

  const handleChangeSelected = (field, value) =>
    setSelectedRecord((s) => ({ ...s, [field]: value }));

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

  // CSV export helper — ensures proper quoting, headers and download
  const exportToCsv = (rows, filename = "data.csv", columns = []) => {
    try {
      if (!rows || rows.length === 0) {
        // still offer an empty CSV with headers
      }
      const escape = (v) => {
        if (v === null || v === undefined) return "";
        const s = String(v);
        if (s.includes('"') || s.includes(",") || s.includes("\n")) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };

      const headerRow = columns.map((c) => c.label || c.key).join(",");
      const dataRows = (rows || []).map((r) =>
        columns.map((c) => escape(r[c.key])).join(",")
      );

      const csv = [headerRow, ...dataRows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
    }
  };

  // table department list - use static DEPARTMENTS only
  const tableDepartments = useMemo(() => ["All", ...DEPARTMENTS], []);

  const employees = useMemo(() => {
    // prefer fetchedEmployees (from backend) names; fallback to records
    if (fetchedEmployees && fetchedEmployees.length > 0) {
      return fetchedEmployees.map((e) => e.name).sort();
    }
    const set = new Set(records.map((r) => r.name));
    return Array.from(set).sort();
  }, [records, fetchedEmployees]);

  const filteredRecords = useMemo(() => {
    // apply filters (department, month, name, status) and sort by date desc (newest first)
    const list = records.filter((r) => {
      const sameDept = selectedDept === "All" || r.department === selectedDept;
      let inDate = true;
      if (selectedMonth && selectedMonth !== "All") {
        inDate = dayjs(r.date).format("YYYY-MM") === selectedMonth;
      }
      const matchesName =
        searchName === "" ||
        (r.name || "").toLowerCase().includes(searchName.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return sameDept && inDate && matchesName && matchesStatus;
    });

    list.sort((a, b) => {
      const da = dayjs(a.date);
      const db = dayjs(b.date);
      if (!da.isValid() && !db.isValid()) return 0;
      if (!da.isValid()) return 1;
      if (!db.isValid()) return -1;
      if (da.isAfter(db)) return -1;
      if (da.isBefore(db)) return 1;
      return 0;
    });

    return list;
  }, [records, selectedDept, selectedMonth, searchName, statusFilter]);

  // selected employee for Employee Attendance Record tab
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empPage, setEmpPage] = useState(0);
  const [empRowsPerPage, setEmpRowsPerPage] = useState(10);

  const employeeFilteredRecords = useMemo(() => {
    if (!selectedEmployee) return [];
    return records
      .filter((r) => {
        if (r.name !== selectedEmployee) return false;
        // apply date range if present
        const d = dayjs(r.date);
        if (dateFrom) {
          const from = dayjs(dateFrom);
          if (d.isBefore(from, "day")) return false;
        }
        if (dateTo) {
          const to = dayjs(dateTo);
          if (d.isAfter(to, "day")) return false;
        }
        if (statusFilter && statusFilter !== "All" && r.status !== statusFilter)
          return false;
        return true;
      })
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [records, selectedEmployee, dateFrom, dateTo, statusFilter]);

  // inner tab state for selected employee view
  const [subTab, setSubTab] = useState(0);
  const [summaryMonth, setSummaryMonth] = useState(
    months[0] || dayjs().format("YYYY-MM")
  );

  // helpers to format backend DTOs
  const formatTime = (datetime) => {
    if (!datetime) return "-";
    return dayjs(datetime).format("hh:mm A");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return dayjs(date).format("MMM D, YYYY");
  };

  useEffect(() => {
    fetchEmployees();
    fetchMyState();
    // fetch all records for the table on initial load
    fetchOverviewMonth("All");
  }, []);

  const fetchTodayCounts = async () => {
    try {
      const res = await axiosInstance.get("/attendance/today");
      setStats(res.data || { present: 0, absent: 0, onLeave: 0 });
    } catch (err) {
      console.error("Failed to fetch today counts", err);
    }
  };

  useEffect(() => {
    fetchTodayCounts();
  }, []);

  // fetch chart data for a specific month (keeps table data separate)
  const fetchMonthlyChart = async (month) => {
    try {
      // request month-specific overview from backend
      const res = await axiosInstance.get("/attendance/overview", {
        params: { month },
      });
      const data = res.data || [];
      // build daily aggregates for the returned month
      const monthStart = dayjs((month || dayjs().format("YYYY-MM")) + "-01");
      const daysInMonth = monthStart.daysInMonth();
      const mCounts = Array.from({ length: daysInMonth }, (_, i) => ({
        day: String(i + 1),
        Present: 0,
        OnLeave: 0,
        Absent: 0,
      }));
      data.forEach((d) => {
        const dateStr = d.workDate || d.date || null;
        if (!dateStr) return;
        const dnum = dayjs(dateStr).date();
        const idx = Math.max(0, Math.min(daysInMonth - 1, dnum - 1));
        const status =
          (d.status ||
            (d.paidMinutes && d.paidMinutes > 0 ? "Present" : "Absent")) + "";
        if (status === "Present") mCounts[idx].Present += 1;
        else if (status === "On Leave") mCounts[idx].OnLeave += 1;
        else mCounts[idx].Absent += 1;
      });
      setMonthlyData(mCounts);
    } catch (e) {
      console.error("Failed to fetch monthly chart data", e);
      setMonthlyData([]);
    }
  };

  // fetch chart data when chartMonth changes
  useEffect(() => {
    if (chartMonth) fetchMonthlyChart(chartMonth);
  }, [chartMonth]);

  const fetchOverviewMonth = async (month) => {
    try {
      let res;
      if (month && month !== "All") {
        res = await axiosInstance.get("/attendance/overview", {
          params: { month },
        });
      } else {
        res = await axiosInstance.get("/attendance/overview");
      }
      const data = res.data || [];
      const mapped = data.map((d, idx) => ({
        id: idx,
        employeeId: d.employeeId,
        name: d.name || `EMP${d.employeeId}`,
        department: d.department || "",
        date: d.workDate,
        // convert timestamps to HH:mm so the edit time inputs accept values
        checkIn: d.firstIn ? dayjs(d.firstIn).format("HH:mm") : "",
        checkOut: d.lastOut ? dayjs(d.lastOut).format("HH:mm") : "",
        status:
          d.status ||
          (d.paidMinutes && d.paidMinutes > 0 ? "Present" : "Absent"),
      }));
      setRecords(mapped);
    } catch (err) {
      console.error("Failed to fetch monthly overview", err);
      setRecords([]);
    }
  };

  // fetch all employees for selection
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/hr/employees");
      setFetchedEmployees(res.data || []);
    } catch (err) {
      console.error("Failed to fetch employees", err);
    }
  };

  // fetch attendance state for current user (canCheckIn / canCheckOut etc)
  const fetchMyState = async () => {
    try {
      const res = await axiosInstance.get("/attendance/me/state");
      setAttendanceState(res.data || null);
    } catch (err) {
      console.error("Failed to fetch attendance state", err);
    }
  };

  // fetch attendance summary (daily dtos) for an employee id
  const fetchEmployeeAttendance = async (empId, month) => {
    if (!empId) return;
    setEmpLoading(true);
    try {
      const res = await axiosInstance.get(`/attendance/${empId}`, {
        params: { month },
      });
      const data = res.data || [];
      const mapped = data.map((d, idx) => ({
        id: idx,
        date: d.workDate,
        checkIn: d.firstIn,
        checkOut: d.lastOut,
        breakMinutes: d.breakMinutes,
        paidMinutes: d.paidMinutes,
        status: d.paidMinutes && d.paidMinutes > 0 ? "Present" : "Absent",
      }));
      setEmployeeAttendanceRecords(mapped);
    } catch (err) {
      console.error("Failed to fetch attendance for employee", err);
      setEmployeeAttendanceRecords([]);
    } finally {
      setEmpLoading(false);
    }
  };

  const handlePunch = async (type) => {
    try {
      await axiosInstance.post(`/attendance/punch`, null, { params: { type } });
      await fetchMyState();
      await fetchTodayCounts();
      await fetchOverviewMonth(chartMonth);
    } catch (err) {
      console.error("Punch failed", err);
    }
  };

  // refetch employee attendance when selected employee or month changes
  useEffect(() => {
    if (!selectedEmployee) return;
    const emp = fetchedEmployees.find((x) => x.name === selectedEmployee);
    if (emp) fetchEmployeeAttendance(emp.id, summaryMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryMonth, selectedEmployee, fetchedEmployees]);

  // summary metrics for selected employee + month
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
      const wd = day.day(); // 0 Sun .. 6 Sat
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

    // average working hours per day (only for records with valid check-in/out)
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

  // (weeklyGroups removed — monthly/weekly view disabled)

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Attendance Management
      </Typography>

      {/* Quick punch controls for current user (uses attendance state to enable actions) */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mb: 2 }}>
        {attendanceState?.canBreakOut && (
          <Button variant="outlined" onClick={() => handlePunch("BREAK_OUT")}>
            Start Break
          </Button>
        )}
        {attendanceState?.canBreakIn && (
          <Button variant="outlined" onClick={() => handlePunch("BREAK_IN")}>
            End Break
          </Button>
        )}
        {attendanceState?.canCheckOut && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handlePunch("CHECK_OUT")}
          >
            Check Out
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ ...cardSx }} elevation={1}>
            <Typography variant="body2" color="text.secondary">
              No of present employees
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {stats.present}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ ...cardSx }} elevation={1}>
            <Typography variant="body2" color="text.secondary">
              No of absent employees
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {stats.absent}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ ...cardSx }} elevation={1}>
            <Typography variant="body2" color="text.secondary">
              No of on leave employees
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {stats.onLeave}
            </Typography>
          </Paper>
          a
        </Grid>

        {/* 'No of late employees' card removed per request */}
      </Grid>

      {/* Charts section: Weekly / Monthly / Overview tabs */}
      <Paper sx={{ mt: 3, p: 2 }}>
        {/* Monthly chart (Overview tab removed) */}
        <Typography variant="h6" gutterBottom>
          Monthly Attendance Overview
        </Typography>

        {/* Chart filters removed from here so the chart is visually separate from searching/filtering */}

        {/* Chart area + legend controls */}
        <Box sx={{ width: "100%", height: 420, overflow: "hidden" }}>
          {/* Month selector inside the chart area (top-right) */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
            <FormControl size="large" sx={{ minWidth: 160 }}>
              <InputLabel>Month</InputLabel>
              <Select
                value={chartMonth}
                label="Month"
                onChange={(e) => setChartMonth(e.target.value)}
              >
                {months.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Present" stackId="a" fill="#4B49AC" />
              <Bar dataKey="OnLeave" stackId="a" fill="#7DA0FA" />
              <Bar dataKey="Absent" stackId="a" fill="#F3797E" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Daily / Employee attendance records */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Tabs
          value={recordsTab}
          onChange={(_, v) => setRecordsTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Daily Attendance Record" />
          <Tab label="Employee Attendance Record" />
        </Tabs>

        {recordsTab === 0 && (
          <>
            {/* Controls */}
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} md={6} lg={7}>
                <Autocomplete
                  freeSolo
                  options={employees}
                  value={searchName}
                  onChange={(e, newVal) => setSearchName(newVal || "")}
                  inputValue={searchName}
                  onInputChange={(e, newInput) => setSearchName(newInput)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      size="small"
                      placeholder="Search employee"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* Chart controls removed from here; chart month selector is in the chart area */}

              <Grid item xs={6} md={2} lg={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={selectedDept}
                    label="Department"
                    onChange={(e) => setSelectedDept(e.target.value)}
                  >
                    {tableDepartments.map((d) => (
                      <MenuItem key={d} value={d}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6} md={2} lg={1}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    {statuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* From/To date filters removed from the Daily Attendance Record tab */}

              <Grid item xs={12} md={12}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setDateFrom("");
                      setDateTo("");
                      setSearchName("");
                      setStatusFilter("All");
                      setSelectedDept("All");
                      setSelectedMonth(dayjs().format("YYYY-MM"));
                    }}
                  >
                    Reset
                  </Button>
                  {/* Add Record button removed per request */}
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      const columns = [
                        { key: "id", label: "ID" },
                        { key: "name", label: "Employee Name" },
                        { key: "department", label: "Department" },
                        { key: "date", label: "Date" },
                        { key: "checkIn", label: "Check-In" },
                        { key: "checkOut", label: "Check-Out" },
                        { key: "status", label: "Status" },
                      ];
                      const fileName = `daily_attendance_${
                        selectedMonth || "all"
                      }.csv`;
                      exportToCsv(filteredRecords, fileName, columns);
                    }}
                  >
                    Export
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Table */}

            <Paper sx={{ borderRadius: "8px", p: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Check-In</TableCell>
                    <TableCell>Check-Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRecords
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>{r.date}</TableCell>
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
                        <TableCell align="center">
                          <IconButton
                            sx={{ color: "#4B49AC" }}
                            onClick={() => handleEdit(r)}
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              <TablePagination
                component="div"
                count={filteredRecords.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Paper>

            {/* Edit Dialog */}
            <Dialog
              open={openEdit}
              onClose={handleCloseEdit}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Edit Attendance Record</DialogTitle>
              <DialogContent dividers>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Employee Name"
                  value={selectedRecord?.name || ""}
                  disabled
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Date"
                  value={selectedRecord?.date || ""}
                  disabled
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Check-In"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={selectedRecord?.checkIn || ""}
                  onChange={(e) =>
                    handleChangeSelected("checkIn", e.target.value)
                  }
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Check-Out"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={selectedRecord?.checkOut || ""}
                  onChange={(e) =>
                    handleChangeSelected("checkOut", e.target.value)
                  }
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={selectedRecord?.status || ""}
                    label="Status"
                    onChange={(e) =>
                      handleChangeSelected("status", e.target.value)
                    }
                  >
                    {statuses.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseEdit}>Cancel</Button>
                <Button
                  onClick={handleSaveEdit}
                  variant="contained"
                  sx={{ backgroundColor: "#4B49AC" }}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>

            {/* Add dialog removed */}
          </>
        )}

        {recordsTab === 1 && (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Employee Attendance
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={fetchedEmployees.map((e) => e.name)}
                  value={selectedEmployee}
                  onChange={(_, newVal) => {
                    setSelectedEmployee(newVal || null);
                    setEmpPage(0);
                    if (newVal) {
                      const emp = fetchedEmployees.find(
                        (x) => x.name === newVal
                      );
                      if (emp) fetchEmployeeAttendance(emp.id, summaryMonth);
                    } else {
                      setEmployeeAttendanceRecords([]);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Search employee"
                      size="small"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Box
                  sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
                >
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSelectedEmployee(null);
                      setEmpPage(0);
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {!selectedEmployee ? (
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2">
                  Search and select an employee to view their attendance
                  records.
                </Typography>
              </Paper>
            ) : (
              <>
                {/* Inner tabs for selected employee */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs value={subTab} onChange={(_, v) => setSubTab(v)}>
                    <Tab label="Attendance Records" />
                    <Tab label="Attendance Summaries" />
                  </Tabs>
                </Box>

                {subTab === 0 && (
                  // Attendance Records: table similar to Daily Attendance Record with edit action
                  <>
                    {empLoading ? (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          py: 4,
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Paper sx={{ borderRadius: "8px", p: 1, mb: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Department</TableCell>
                              <TableCell>Check-In</TableCell>
                              <TableCell>Check-Out</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="center">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {(employeeAttendanceRecords &&
                            employeeAttendanceRecords.length > 0
                              ? employeeAttendanceRecords
                              : employeeFilteredRecords
                            )
                              .slice(
                                empPage * empRowsPerPage,
                                empPage * empRowsPerPage + empRowsPerPage
                              )
                              .map((r) => (
                                <TableRow key={r.id}>
                                  <TableCell>{formatDate(r.date)}</TableCell>
                                  <TableCell>{r.department || ""}</TableCell>
                                  <TableCell>{formatTime(r.checkIn)}</TableCell>
                                  <TableCell>
                                    {formatTime(r.checkOut)}
                                  </TableCell>
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
                                  <TableCell align="center">
                                    <IconButton
                                      sx={{ color: "#4B49AC" }}
                                      onClick={() => handleEdit(r)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                        <TablePagination
                          component="div"
                          count={
                            employeeAttendanceRecords &&
                            employeeAttendanceRecords.length > 0
                              ? employeeAttendanceRecords.length
                              : employeeFilteredRecords.length
                          }
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
                  </>
                )}

                {subTab === 1 && (
                  // Attendance Summaries
                  <>
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
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
              </>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}
