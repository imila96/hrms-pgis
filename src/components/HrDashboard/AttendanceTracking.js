// import React, { useState, useEffect } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Select,
//   MenuItem,
//   TextField,
//   Grid,
//   Avatar,
//   CircularProgress,
// } from "@mui/material";
// import axiosInstance from "../../AxiosInstance";
// import dayjs from "dayjs";
// import BackButton from "../common/BackButton";

// const AttendanceTracking = () => {
//   const [attendanceRecords, setAttendanceRecords] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [selectedEmployee, setSelectedEmployee] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState(null);

//   useEffect(() => {
//     fetchEmployees();
//   }, []);

//   useEffect(() => {
//     if (selectedEmployee) {
//       fetchAttendanceData();
//     }
//   }, [selectedEmployee, selectedMonth]);

//   const fetchEmployees = async () => {
//     try {
//       const response = await axiosInstance.get(
//         "http://localhost:8080/hr/employees"
//       );
//       setEmployees(response.data);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//     }
//   };

//   const fetchAttendanceData = async () => {
//     setLoading(true);
//     try {
//       const response = await axiosInstance.get(
//         `http://localhost:8080/attendance/${selectedEmployee}`,
//         {
//           params: { month: selectedMonth },
//         }
//       );
//       setAttendanceRecords(response.data);
//       calculateSummary(response.data);
//     } catch (error) {
//       console.error("Error fetching attendance data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const calculateSummary = (records) => {
//     const presentDays = records.filter((r) => r.paidMinutes > 0).length;
//     const absentDays = records.filter((r) => !r.firstIn && !r.lastOut).length;
//     const totalPaidMinutes = records.reduce((sum, r) => sum + r.paidMinutes, 0);
//     const avgWorkingMinutes = presentDays
//       ? Math.round(totalPaidMinutes / presentDays)
//       : 0;

//     setSummary({
//       presentDays,
//       absentDays,
//       totalPaidMinutes,
//       avgWorkingMinutes,
//     });
//   };

//   const formatTime = (datetime) => {
//     if (!datetime) return "-";
//     return dayjs(datetime).format("hh:mm A");
//   };

//   const formatDate = (date) => {
//     return dayjs(date).format("MMM D, YYYY");
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <BackButton />
//       <Typography variant="h5" gutterBottom>
//         Attendance Tracking
//       </Typography>

//       {/* Filters Section */}
//       <Paper sx={{ p: 2, mb: 3 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} md={6}>
//             <Select
//               fullWidth
//               value={selectedEmployee}
//               onChange={(e) => setSelectedEmployee(e.target.value)}
//               displayEmpty
//             >
//               <MenuItem value="">Select Employee</MenuItem>
//               {employees.map((emp) => (
//                 <MenuItem key={emp.id} value={emp.id}>
//                   <Grid container alignItems="center" spacing={1}>
//                     <Grid item>
//                       {emp.name} (EMP{emp.id.toString()})
//                     </Grid>
//                   </Grid>
//                 </MenuItem>
//               ))}
//             </Select>
//           </Grid>

//           <Grid item xs={12} md={6}>
//             <TextField
//               label="Select Month"
//               type="month"
//               value={selectedMonth}
//               onChange={(e) => setSelectedMonth(e.target.value)}
//               fullWidth
//               InputLabelProps={{ shrink: true }}
//             />
//           </Grid>
//         </Grid>
//       </Paper>

//       {loading ? (
//         <Box display="flex" justifyContent="center" mt={5}>
//           <CircularProgress />
//         </Box>
//       ) : (
//         <>
//           {/* Summary Panel */}
//           {summary && (
//             <Paper sx={{ p: 2, mb: 3 }}>
//               <Typography variant="subtitle1">Monthly Summary</Typography>
//               <Grid container spacing={2}>
//                 <Grid item xs={12} sm={3}>
//                   Present Days: {summary.presentDays}
//                 </Grid>
//                 <Grid item xs={12} sm={3}>
//                   Absent Days: {summary.absentDays}
//                 </Grid>
//                 <Grid item xs={12} sm={3}>
//                   Total Paid Hours: {(summary.totalPaidMinutes / 60).toFixed(1)}{" "}
//                   hrs
//                 </Grid>
//                 <Grid item xs={12} sm={3}>
//                   Avg Daily Hours: {(summary.avgWorkingMinutes / 60).toFixed(1)}{" "}
//                   hrs
//                 </Grid>
//               </Grid>
//             </Paper>
//           )}

//           {/* Attendance Table */}
//           <Paper>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>Date</TableCell>
//                   <TableCell>First In</TableCell>
//                   <TableCell>Last Out</TableCell>
//                   <TableCell>Break (min)</TableCell>
//                   <TableCell>Paid (min)</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {attendanceRecords.map((rec) => (
//                   <TableRow key={rec.workDate}>
//                     <TableCell>{formatDate(rec.workDate)}</TableCell>
//                     <TableCell>{formatTime(rec.firstIn)}</TableCell>
//                     <TableCell>{formatTime(rec.lastOut)}</TableCell>
//                     <TableCell>{rec.breakMinutes}</TableCell>
//                     <TableCell>{rec.paidMinutes}</TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </Paper>
//         </>
//       )}
//     </Box>
//   );
// };

// export default AttendanceTracking;
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

// Simplified Attendance Management overview
export default function AttendanceTracking() {
  // TODO: replace the mock numbers with real calculations from your backend or context
  const stats = {
    present: 120,
    absent: 12,
    onLeave: 8,
    late: 5,
  };

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
  const chartDepartments = [
    "All",
    "Computer Science",
    "Mathematics",
    "Physics",
    "Admin",
  ];
  const months = useMemo(() => {
    // last 6 months as YYYY-MM
    const out = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = d.toISOString().slice(0, 7);
      out.push(ym);
    }
    return out;
  }, []);

  const [chartDept, setChartDept] = useState("All");
  const [chartMonth, setChartMonth] = useState(months[0]);
  // department selected for pie chart (All = overall)
  const [pieDept, setPieDept] = useState("All");

  // deterministic pseudo-random helper based on seed string
  function seededVal(seed, mod = 10, offset = 0) {
    let s = 0;
    for (let i = 0; i < seed.length; i++) s = (s << 5) - s + seed.charCodeAt(i);
    s = Math.abs(s);
    return (s % mod) + offset;
  }

  // build weekly data (days of week)
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d) => {
      const seed = `${chartDept}-${chartMonth}-${d}`;
      const present = seededVal(seed + "p", 40, 20);
      const onLeave = seededVal(seed + "l", 8, 0);
      const absent = seededVal(seed + "a", 6, 0);
      return { day: d, Present: present, OnLeave: onLeave, Absent: absent };
    });
  }, [chartDept, chartMonth]);

  // build monthly data (days 1..28 simplified)
  const monthlyData = useMemo(() => {
    const days = Array.from({ length: 28 }, (_, i) => i + 1);
    return days.map((d) => {
      const seed = `${chartDept}-${chartMonth}-day${d}`;
      const present = seededVal(seed + "p", 30, 10);
      const onLeave = seededVal(seed + "l", 5, 0);
      const absent = seededVal(seed + "a", 4, 0);
      return {
        day: String(d),
        Present: present,
        OnLeave: onLeave,
        Absent: absent,
      };
    });
  }, [chartDept, chartMonth]);

  // --- Daily / Employee attendance records section state ---
  const [recordsTab, setRecordsTab] = useState(0);

  // Mock data for the attendance records table (November 2025 sample)
  const dataDepartments = [
    "IT",
    "Finance",
    "Academic",
    "Admin",
    "HR",
    "Operations",
  ];
  const names = [
    "John Doe",
    "Jane Smith",
    "Dr. Alex Brown",
    "Emma Johnson",
    "Carlos Vega",
    "Maya Patel",
    "Liam Nguyen",
    "Olivia Chen",
  ];
  const statuses = ["Present", "Absent", "On Leave", "Late"];

  const generateInitialData = () => {
    const arr = [];
    let idCounter = 1;
    for (let d = 1; d <= 30; d++) {
      const day = d < 10 ? `2025-11-0${d}` : `2025-11-${d}`;
      for (let i = 0; i < names.length; i++) {
        const dept = dataDepartments[i % dataDepartments.length];
        const name = names[i];
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
          id: idCounter++,
          name,
          department: dept,
          date: day,
          checkIn,
          checkOut,
          status,
        });
      }
    }
    return arr;
  };

  const [records, setRecords] = useState(() => generateInitialData());
  // --- compute department totals and pie data for Overview (depends on records) ---
  const deptTotals = useMemo(() => {
    const map = new Map();
    records.forEach((r) => {
      if (
        chartMonth &&
        chartMonth !== "All" &&
        dayjs(r.date).format("YYYY-MM") !== chartMonth
      )
        return;
      const key = r.department || "Unknown";
      if (!map.has(key)) map.set(key, new Set());
      map.get(key).add(r.name);
    });
    return Array.from(map.entries()).map(([department, namesSet]) => ({
      department,
      count: namesSet.size,
    }));
  }, [records, chartMonth]);

  const pieData = useMemo(() => {
    const counts = { Present: 0, "On Leave": 0, Absent: 0, Late: 0 };
    records.forEach((r) => {
      if (
        chartMonth &&
        chartMonth !== "All" &&
        dayjs(r.date).format("YYYY-MM") !== chartMonth
      )
        return;
      if (pieDept !== "All" && r.department !== pieDept) return;
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    });
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) {
      // fallback seeded mock so the chart isn't empty
      const statuses = ["Present", "On Leave", "Absent", "Late"];
      const seedBase = `${chartMonth}-${pieDept}`;
      return statuses.map((s) => ({
        name: s,
        value: seededVal(seedBase + "-" + s, 40, 10),
      }));
    }
    return Object.keys(counts).map((k) => ({ name: k, value: counts[k] }));
  }, [records, chartMonth, pieDept]);

  const pieColors = {
    Present: "#4B49AC",
    Absent: "#F3797E",
    "On Leave": "#7DA0FA",
    Late: "#F4C430",
  };
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
    department: dataDepartments[0],
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
      department: dataDepartments[0],
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

  const tableDepartments = useMemo(() => {
    const set = new Set(records.map((r) => r.department));
    return ["All", ...Array.from(set)];
  }, [records]);

  const employees = useMemo(() => {
    const set = new Set(records.map((r) => r.name));
    return Array.from(set).sort();
  }, [records]);

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

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ ...cardSx }} elevation={1}>
            <Typography variant="body2" color="text.secondary">
              No of late employees
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>
              {stats.late}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts section: Weekly / Monthly / Overview tabs */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Tabs
          value={chartTab}
          onChange={(_, v) => setChartTab(v)}
          sx={{ mb: 2 }}
        >
          <Tab label="Weekly" />
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
        <Box sx={{ width: "100%", height: 520 }}>
          {/* Overview controls removed toggle chips; show department-level charts in Overview tab */}

          <ResponsiveContainer width="100%" height="100%">
            {chartTab === 0 ? (
              <BarChart
                data={weeklyData}
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
            ) : chartTab === 1 ? (
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
                {/* Overview: show total employees by department (bar) and a pie chart for status distribution for selected department/month */}
                <Grid container spacing={2}>
                  <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2, height: 440 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Total employees by department ({chartMonth})
                      </Typography>
                      <ResponsiveContainer width="100%" height={340}>
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
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, height: 440 }}>
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

                      <ResponsiveContainer width="100%" height={340}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
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
                    {dataDepartments.map((d) => (
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
                  options={employees}
                  value={selectedEmployee}
                  onChange={(_, newVal) => {
                    setSelectedEmployee(newVal || null);
                    setEmpPage(0);
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
