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
  Add as AddIcon,
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
  PieChart,
  Pie,
  Cell,
} from "recharts";

import axiosInstance from "../../AxiosInstance";

// Simplified Attendance Management overview
// static department master list (preferred for filters)
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
  // runtime stats fetched from backend
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

  // Chart tab state: 0 = Weekly, 1 = Monthly, 2 = Overview
  const [chartTab, setChartTab] = useState(0);
  const [chartDept, setChartDept] = useState("All");
  const [pieDept, setPieDept] = useState("All");
  const months = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = d.toISOString().slice(0, 7);
      out.push(ym);
    }
    return out;
  }, []);
  const [chartMonth, setChartMonth] = useState(months[0]);
  
  const [fetchedEmployees, setFetchedEmployees] = useState([]);
  const [employeeAttendanceRecords, setEmployeeAttendanceRecords] = useState(
    []
  );
  const [empLoading, setEmpLoading] = useState(false);
  const [attendanceState, setAttendanceState] = useState(null);

  // Aggregated chart data from backend overview
  const [monthlyData, setMonthlyData] = useState([]);
  const [deptTotals, setDeptTotals] = useState([]);
  const [pieData, setPieData] = useState([]);
  
  // Pie chart colors for attendance status
  const pieColors = {
    Present: "#4B49AC",
    Absent: "#F3797E",
    "On Leave": "#7DA0FA",
    Late: "#F4C430",
  };

  // --- Daily / Employee attendance records section state ---
  const [recordsTab, setRecordsTab] = useState(0);

  // department options derived from backend data (populated later)
  const statuses = ["Present", "Absent", "On Leave", "Late"];

  const [records, setRecords] = useState([]);
  // derived departments for chart filter - use static DEPARTMENTS only
  const chartDepartments = useMemo(() => ["All", ...DEPARTMENTS], []);
  
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [newRecord, setNewRecord] = useState({
    name: "",
    department: "",
    date: dayjs().format("YYYY-MM-DD"),
    checkIn: "",
    checkOut: "",
    status: "Present",
  });

  const handleEdit = (record) => {
    setSelectedRecord(record);
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setSelectedRecord(null);
    setOpenEdit(false);
  };
  const handleSaveEdit = () => {
    setRecords((prev) =>
      prev.map((r) => (r.id === selectedRecord.id ? selectedRecord : r))
    );
    setOpenEdit(false);
  };

  const handleAddOpen = () => setAddOpen(true);
  const handleAddClose = () => {
    setAddOpen(false);
    setNewRecord({
      name: "",
      department: (tableDepartments && tableDepartments[1]) || "",
      date: dayjs().format("YYYY-MM-DD"),
      checkIn: "",
      checkOut: "",
      status: "Present",
    });
  };
  const handleAddSave = () => {
    const nextId = records.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    setRecords((prev) => [{ ...newRecord, id: nextId }, ...prev]);
    handleAddClose();
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
    return records.filter((r) => {
      const sameDept = selectedDept === "All" || r.department === selectedDept;
      let inDate = true;
      if (dateFrom || dateTo) {
        const d = dayjs(r.date);
        if (dateFrom) {
          const from = dayjs(dateFrom);
          inDate = inDate && (d.isAfter(from) || d.isSame(from, "day"));
        }
        if (dateTo) {
          const to = dayjs(dateTo);
          inDate = inDate && (d.isBefore(to) || d.isSame(to, "day"));
        }
      } else if (selectedMonth && selectedMonth !== "All") {
        inDate = dayjs(r.date).format("YYYY-MM") === selectedMonth;
      }
      const matchesName =
        searchName === "" ||
        r.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;
      return sameDept && inDate && matchesName && matchesStatus;
    });
  }, [
    records,
    selectedDept,
    selectedMonth,
    dateFrom,
    dateTo,
    searchName,
    statusFilter,
  ]);

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
  const [viewMode, setViewMode] = useState("monthly");

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
    fetchOverviewMonth(chartMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchOverviewMonth(chartMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartMonth]);

  const fetchOverviewMonth = async (month) => {
    try {
      const res = await axiosInstance.get("/attendance/overview", {
        params: { month },
      });
      const data = res.data || [];
      // map backend maps to UI rows: employeeId, name, workDate, firstIn, lastOut, breakMinutes, paidMinutes
      const mapped = data.map((d, idx) => ({
        id: idx,
        name: d.name || `EMP${d.employeeId}`,
        department: d.department || "",
        date: d.workDate,
        checkIn: d.firstIn,
        checkOut: d.lastOut,
        status: d.paidMinutes && d.paidMinutes > 0 ? "Present" : "Absent",
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

  // compute aggregated datasets (monthly) from records + filters
  useEffect(() => {
    try {
      const month = chartMonth;
      const monthStart = dayjs((month || dayjs().format("YYYY-MM")) + "-01");
      const daysInMonth = monthStart.daysInMonth();

      const filtered = records.filter((r) => {
        if (
          month &&
          month !== "All" &&
          dayjs(r.date).format("YYYY-MM") !== month
        )
          return false;
        if (chartDept && chartDept !== "All" && r.department !== chartDept)
          return false;
        return true;
      });

      // monthly aggregates (1..daysInMonth)
      const mCounts = Array.from({ length: daysInMonth }, (_, i) => ({
        day: String(i + 1),
        Present: 0,
        OnLeave: 0,
        Absent: 0,
      }));
      filtered.forEach((r) => {
        const dnum = dayjs(r.date).date();
        const idx = Math.max(0, Math.min(daysInMonth - 1, dnum - 1));
        if (r.status === "Present") mCounts[idx].Present += 1;
        else if (r.status === "On Leave") mCounts[idx].OnLeave += 1;
        else mCounts[idx].Absent += 1;
      });

      setMonthlyData(mCounts);

      // Compute department totals for bar chart in Overview tab
      const deptMap = {};
      records.forEach((r) => {
        if (month && month !== "All" && dayjs(r.date).format("YYYY-MM") !== month) return;
        const dept = r.department || "Unknown";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });
      const deptData = Object.entries(deptMap).map(([department, count]) => ({
        department,
        count,
      }));
      setDeptTotals(deptData);

      // Compute pie chart data for attendance distribution
      const pieFiltered = records.filter((r) => {
        if (month && month !== "All" && dayjs(r.date).format("YYYY-MM") !== month)
          return false;
        if (pieDept && pieDept !== "All" && r.department !== pieDept)
          return false;
        return true;
      });
      const statusMap = {};
      pieFiltered.forEach((r) => {
        const status = r.status || "Unknown";
        statusMap[status] = (statusMap[status] || 0) + 1;
      });
      const pieChartData = Object.entries(statusMap).map(([name, value]) => ({
        name,
        value,
      }));
      setPieData(pieChartData);
    } catch (e) {
      console.error("Failed to compute aggregates", e);
      setMonthlyData([]);
      setDeptTotals([]);
      setPieData([]);
    }
  }, [records, chartDept, chartMonth, pieDept]);

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

  // calendar data for visualizations (weeklyGroups computed below)
  const weeklyGroups = useMemo(() => {
    // Build calendar weeks aligned to Monday..Sunday
    const monthStart = dayjs(summaryMonth + "-01");
    const daysInMonth = monthStart.daysInMonth();
    const firstDay = monthStart.day(); // 0 Sun .. 6 Sat
    // offset: number of blank cells before day 1 when week starts on Monday
    const offset = (firstDay + 6) % 7;
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
        </Grid>

        {/* 'No of late employees' card removed per request */}
      </Grid>

      {/* Charts section: Weekly / Monthly / Overview tabs */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Tabs
          value={chartTab}
          onChange={(_, v) => setChartTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Monthly" />
          <Tab label="Overview" />
        </Tabs>

        {/* Filters row */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={chartDept}
                label="Department"
                onChange={(e) => setChartDept(e.target.value)}
              >
                {chartDepartments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
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
          </Grid>
        </Grid>

        {/* Chart area + legend controls */}
        <Box sx={{ width: "100%", height: 420, overflow: "hidden" }}>
          {/* Overview controls removed toggle chips; show department-level charts in Overview tab */}

          <ResponsiveContainer width="100%" height="100%">
            {chartTab === 0 ? (
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
            ) : (
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="stretch">
                  {/* Bar chart */}
                  <Grid item xs={12} md={7}>
                    <Paper
                      sx={{
                        p: 2,
                        height: 340,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        overflow: "hidden",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Total employees by department ({chartMonth})
                      </Typography>

                      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={deptTotals}
                            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                          >
                            <XAxis dataKey="department" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4B49AC" />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>

                  {/* Pie chart */}
                  <Grid item xs={12} md={5}>
                    <Paper
                      sx={{
                        p: 2,
                        height: 340,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        overflow: "hidden",
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Attendance distribution ({chartMonth})
                      </Typography>

                      <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel>Department</InputLabel>
                        <Select
                          value={pieDept}
                          label="Department"
                          onChange={(e) => setPieDept(e.target.value)}
                        >
                          <MenuItem value="All">All</MenuItem>
                          {tableDepartments
                            .filter((d) => d !== "All")
                            .map((d) => (
                              <MenuItem key={d} value={d}>
                                {d}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>

                      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius="70%"
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(1)}%`
                              }
                              labelLine={false}
                            >
                              {pieData.map((entry) => (
                                <Cell
                                  key={entry.name}
                                  fill={pieColors[entry.name] || "#8884d8"}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>
            )}
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

              <Grid item xs={6} md={1} lg={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="From"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} md={1} lg={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="To"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

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
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddOpen}
                  >
                    Add Record
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<DownloadIcon />}
                    onClick={() => {
                      // simple CSV export of filteredRows
                      const header = [
                        "id",
                        "name",
                        "department",
                        "date",
                        "checkIn",
                        "checkOut",
                        "status",
                      ];
                      const rows = filteredRecords.map((r) =>
                        header.map((h) => r[h]).join(",")
                      );
                      const blob = new Blob(
                        [[header.join(",")], ...rows].join("\n"),
                        { type: "text/csv" }
                      );
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "daily_attendance.csv";
                      a.click();
                      URL.revokeObjectURL(url);
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

            {/* Add Dialog */}
            <Dialog
              open={addOpen}
              onClose={handleAddClose}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>Add Attendance Record</DialogTitle>
              <DialogContent dividers>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Employee Name"
                  value={newRecord.name}
                  onChange={(e) =>
                    setNewRecord((s) => ({ ...s, name: e.target.value }))
                  }
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={newRecord.department}
                    label="Department"
                    onChange={(e) =>
                      setNewRecord((s) => ({
                        ...s,
                        department: e.target.value,
                      }))
                    }
                  >
                    {tableDepartments
                      .filter((d) => d !== "All")
                      .map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Date"
                  type="date"
                  value={newRecord.date}
                  onChange={(e) =>
                    setNewRecord((s) => ({ ...s, date: e.target.value }))
                  }
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Check-In"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={newRecord.checkIn}
                  onChange={(e) =>
                    setNewRecord((s) => ({ ...s, checkIn: e.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  margin="dense"
                  label="Check-Out"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={newRecord.checkOut}
                  onChange={(e) =>
                    setNewRecord((s) => ({ ...s, checkOut: e.target.value }))
                  }
                />
                <FormControl fullWidth margin="dense">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={newRecord.status}
                    label="Status"
                    onChange={(e) =>
                      setNewRecord((s) => ({ ...s, status: e.target.value }))
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
                <Button onClick={handleAddClose}>Cancel</Button>
                <Button
                  onClick={handleAddSave}
                  variant="contained"
                  sx={{ backgroundColor: "#4B49AC" }}
                >
                  Save
                </Button>
              </DialogActions>
            </Dialog>
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
                    <Tab label="Monthly / Weekly View" />
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

                {subTab === 2 && (
                  // Monthly / Weekly view - improved calendar visualization with month selector
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
                          variant={
                            viewMode === "monthly" ? "contained" : "outlined"
                          }
                          onClick={() => setViewMode("monthly")}
                          sx={{ mr: 1 }}
                        >
                          Monthly
                        </Button>
                        <Button
                          variant={
                            viewMode === "weekly" ? "contained" : "outlined"
                          }
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
                          {[
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                            "Sun",
                          ].map((h) => (
                            <Box key={h} sx={{ p: 1, textAlign: "center" }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {h}
                              </Typography>
                            </Box>
                          ))}
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
                            const bg = rec
                              ? getStatusColor(rec.status)
                              : "#f8f9fb";
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
        )}
      </Paper>
    </Box>
  );
}
