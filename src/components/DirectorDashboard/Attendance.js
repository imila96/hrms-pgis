// src/components/DirectorDashboard/Attendance.js
import React, { useEffect, useMemo, useState } from "react";
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
  TextField,
  InputAdornment,
  Autocomplete,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
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

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // summary stats
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    onLeave: 0,
    late: 0,
  });

  // fetch all attendance
  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axiosInstance.get("/attendance");
      setRecords(res.data || []);
      computeStats(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance records", err);
    }
  };

  const fetchRecordDetails = async (id) => {
    try {
      const res = await axiosInstance.get(`/attendance/${id}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch attendance details", err);
      return null;
    }
  };

  const computeStats = (data) => {
    const present = data.filter((r) => r.status === "Present").length;
    const absent = data.filter((r) => r.status === "Absent").length;
    const onLeave = data.filter((r) => r.status === "On Leave").length;
    const late = data.filter((r) => r.status === "Late").length;
    setStats({ present, absent, onLeave, late });
  };

  // chart state
  const [chartTab, setChartTab] = useState(0);
  const [chartDept, setChartDept] = useState("All");
  const [chartMonth, setChartMonth] = useState(dayjs().format("YYYY-MM"));
  const [pieDept, setPieDept] = useState("All");

  const dataDepartments = useMemo(() => {
    const set = new Set(records.map((r) => r.department));
    return ["All", ...Array.from(set)];
  }, [records]);

  const months = useMemo(() => {
    const out = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push(d.toISOString().slice(0, 7));
    }
    return out;
  }, []);

  const pieColors = {
    Present: "#4B49AC",
    Absent: "#F3797E",
    "On Leave": "#7DA0FA",
    Late: "#F4C430",
  };

  // filter states
  const [searchName, setSearchName] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedDept, setSelectedDept] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  // filtered records
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const sameDept = selectedDept === "All" || r.department === selectedDept;
      const matchesName =
        searchName === "" ||
        r.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesStatus = statusFilter === "All" || r.status === statusFilter;

      let inDate = true;
      if (dateFrom || dateTo) {
        const d = dayjs(r.date);
        if (dateFrom)
          inDate = inDate && d.isAfter(dayjs(dateFrom)) || d.isSame(dayjs(dateFrom), "day");
        if (dateTo)
          inDate = inDate && d.isBefore(dayjs(dateTo)) || d.isSame(dayjs(dateTo), "day");
      }

      return sameDept && matchesName && matchesStatus && inDate;
    });
  }, [records, selectedDept, searchName, statusFilter, dateFrom, dateTo]);

  // charts (mock aggregation)
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((d) => {
      const present = Math.floor(Math.random() * 40 + 10);
      const onLeave = Math.floor(Math.random() * 8);
      const absent = Math.floor(Math.random() * 6);
      return { day: d, Present: present, OnLeave: onLeave, Absent: absent };
    });
  }, [chartDept, chartMonth]);

  const monthlyData = useMemo(() => {
    const days = Array.from({ length: 28 }, (_, i) => i + 1);
    return days.map((d) => ({
      day: String(d),
      Present: Math.floor(Math.random() * 30 + 10),
      OnLeave: Math.floor(Math.random() * 5),
      Absent: Math.floor(Math.random() * 4),
    }));
  }, [chartDept, chartMonth]);

  const pieData = useMemo(() => {
    const counts = { Present: 0, "On Leave": 0, Absent: 0, Late: 0 };
    records.forEach((r) => {
      if (
        chartMonth &&
        dayjs(r.date).format("YYYY-MM") !== chartMonth
      )
        return;
      if (pieDept !== "All" && r.department !== pieDept) return;
      if (counts[r.status] !== undefined) counts[r.status] += 1;
    });
    return Object.keys(counts).map((k) => ({ name: k, value: counts[k] }));
  }, [records, chartMonth, pieDept]);

  // pagination handlers
  const handlePageChange = (event, newPage) => setPage(newPage);
  const handleRowsChange = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={700}>
        Attendance Overview
      </Typography>

      {/* Top Summary Cards */}
      <Grid container spacing={2}>
        {[
          { label: "Present", value: stats.present, color: "#4B49AC" },
          { label: "Absent", value: stats.absent, color: "#F3797E" },
          { label: "On Leave", value: stats.onLeave, color: "#7DA0FA" },
          { label: "Late", value: stats.late, color: "#F4C430" },
        ].map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.label}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {card.label} Employees
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mt: 1, color: card.color }}
              >
                {card.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
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

        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={chartDept}
                label="Department"
                onChange={(e) => setChartDept(e.target.value)}
              >
                {dataDepartments.map((d) => (
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

        <Box sx={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {chartTab === 0 ? (
              <BarChart data={weeklyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" stackId="a" fill="#4B49AC" />
                <Bar dataKey="OnLeave" stackId="a" fill="#7DA0FA" />
                <Bar dataKey="Absent" stackId="a" fill="#F3797E" />
              </BarChart>
            ) : chartTab === 1 ? (
              <BarChart data={monthlyData}>
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Present" stackId="a" fill="#4B49AC" />
                <Bar dataKey="OnLeave" stackId="a" fill="#7DA0FA" />
                <Bar dataKey="Absent" stackId="a" fill="#F3797E" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(1)}%`
                  }
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
            )}
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Attendance Table */}
      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Attendance Records
        </Typography>

        {/* Filters */}
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Autocomplete
              freeSolo
              options={[...new Set(records.map((r) => r.name))]}
              value={searchName}
              onChange={(e, v) => setSearchName(v || "")}
              inputValue={searchName}
              onInputChange={(e, v) => setSearchName(v)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Search employee"
                  size="small"
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
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Department</InputLabel>
              <Select
                value={selectedDept}
                label="Department"
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {dataDepartments.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Present">Present</MenuItem>
                <MenuItem value="Absent">Absent</MenuItem>
                <MenuItem value="On Leave">On Leave</MenuItem>
                <MenuItem value="Late">Late</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
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
          <Grid item xs={6} md={2}>
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
            <Box display="flex" justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => {
                  setSearchName("");
                  setStatusFilter("All");
                  setSelectedDept("All");
                  setDateFrom("");
                  setDateTo("");
                }}
              >
                Reset Filters
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Paper sx={{ borderRadius: "8px" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee Name</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Check-In</TableCell>
                <TableCell>Check-Out</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((r) => (
                  <TableRow
                    key={r.id}
                    hover
                    onClick={async () => {
                      const detail = await fetchRecordDetails(r.id);
                      setSelectedRecord(detail);
                    }}
                    sx={{ cursor: "pointer" }}
                  >
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
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredRecords.length}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleRowsChange}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      </Paper>

      {/* Detail Dialog */}
      {selectedRecord && (
        <Dialog
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Attendance Details</DialogTitle>
          <DialogContent dividers>
            <Typography>
              <strong>Name:</strong> {selectedRecord.name}
            </Typography>
            <Typography>
              <strong>Department:</strong> {selectedRecord.department}
            </Typography>
            <Typography>
              <strong>Date:</strong> {selectedRecord.date}
            </Typography>
            <Typography>
              <strong>Check-In:</strong> {selectedRecord.checkIn}
            </Typography>
            <Typography>
              <strong>Check-Out:</strong> {selectedRecord.checkOut}
            </Typography>
            <Typography>
              <strong>Status:</strong>{" "}
              <span style={{ color: getStatusColor(selectedRecord.status) }}>
                {selectedRecord.status}
              </span>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedRecord(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
