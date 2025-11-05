// src/components/DirectorDashboard/Leave.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TablePagination,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import { format, parseISO, isWithinInterval } from "date-fns";
import axiosInstance from "../../AxiosInstance";

const COLORS = {
  primary: "#4B49AC",
  softBlue: "#98BDFF",
  support: "#7DA0FA",
  alt: "#7978E9",
  accent: "#F3797E",
  bg: "#F5F7FF",
};

export default function DirectorLeave() {
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [allFilterMonth, setAllFilterMonth] = useState("All");
  const [allFilterStatus, setAllFilterStatus] = useState("All");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/leave");
      setRequests(res.data.requests || []);
      setBalances(res.data.balances || []);
    } catch (err) {
      console.error("Failed to fetch leave data", err);
    }
  };

  const departments = useMemo(
    () => ["All", ...Array.from(new Set(requests.map((r) => r.dept)))],
    [requests]
  );
  const leaveTypes = useMemo(
    () => ["All", ...Array.from(new Set(requests.map((r) => r.type)))],
    [requests]
  );
  const months = useMemo(() => {
    const s = new Set();
    requests.forEach((r) => {
      try {
        s.add(format(parseISO(r.startDate), "yyyy-MM"));
      } catch {}
    });
    return ["All", ...Array.from(s).sort().reverse()];
  }, [requests]);

  const filteredRequests = useMemo(() => {
    let list = requests.slice();
    if (tab === 0) list = list.filter((r) => r.status === "Pending");
    if (tab === 1) list = list.filter((r) => r.status === "Approved");
    if (tab === 2) list = list.filter((r) => r.status === "Rejected");
    if (tab === 4) {
      if (allFilterStatus !== "All")
        list = list.filter((r) => r.status === allFilterStatus);
      if (allFilterMonth !== "All")
        list = list.filter(
          (r) =>
            format(parseISO(r.startDate), "yyyy-MM") === allFilterMonth
        );
    }
    if (filterDept !== "All") list = list.filter((r) => r.dept === filterDept);
    if (filterType !== "All") list = list.filter((r) => r.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (r) =>
          r.employeeName.toLowerCase().includes(q) ||
          r.employeeId.toLowerCase().includes(q) ||
          (r.reason || "").toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [
    requests,
    tab,
    filterDept,
    filterType,
    search,
    allFilterMonth,
    allFilterStatus,
  ]);

  const summary = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((r) => r.status === "Pending").length,
      approved: requests.filter((r) => r.status === "Approved").length,
      rejected: requests.filter((r) => r.status === "Rejected").length,
      onLeaveToday: requests.filter((r) =>
        isWithinInterval(new Date(), {
          start: parseISO(r.startDate),
          end: parseISO(r.endDate),
        })
      ).length,
    }),
    [requests]
  );

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openDetail = (r) => {
    setSelectedRequest(r);
    setDetailOpen(true);
  };
  const closeDetail = () => {
    setSelectedRequest(null);
    setDetailOpen(false);
  };

  const exportCSV = (rows) => {
    const header = [
      "ID",
      "Employee ID",
      "Employee Name",
      "Department",
      "Type",
      "Start Date",
      "End Date",
      "Days",
      "Reason",
      "Status",
      "Requested At",
    ];
    const csvRows = [header.join(",")];
    rows.forEach((r) => {
      const row = [
        r.id,
        `"${r.employeeId}"`,
        `"${r.employeeName}"`,
        `"${r.dept}"`,
        `"${r.type}"`,
        r.startDate,
        r.endDate,
        r.days,
        `"${(r.reason || "").replace(/"/g, '""')}"`,
        r.status,
        r.createdAt,
      ];
      csvRows.push(row.join(","));
    });
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave_records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calendarEntries = useMemo(() => {
    const map = {};
    requests.forEach((r) => {
      const start = parseISO(r.startDate);
      const end = parseISO(r.endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = format(new Date(d), "yyyy-MM-dd");
        if (!map[key]) map[key] = [];
        map[key].push(r);
      }
    });
    const keys = Object.keys(map).sort();
    return keys.map((k) => ({ date: k, items: map[k] }));
  }, [requests]);

  return (
    <Box sx={{ p: 3, background: COLORS.bg, minHeight: "80vh" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
            Leave Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View organization-wide leave requests, balances, and calendar.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchData}
          sx={{ color: COLORS.primary, borderColor: COLORS.primary }}
        >
          Refresh Data
        </Button>
      </Stack>

      {/* Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Requests
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.primary}>
              {summary.total}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.alt}>
              {summary.pending}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.support}>
              {summary.approved}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              On Leave Today
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.accent}>
              {summary.onLeaveToday}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Pending (${summary.pending})`} />
          <Tab label={`Approved (${summary.approved})`} />
          <Tab label={`Rejected (${summary.rejected})`} />
          <Tab label="Balances" />
          <Tab label="All" />
          <Tab label="Calendar" />
        </Tabs>
      </Paper>

      {(tab <= 2 || tab === 4) && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by name, ID or reason..."
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: "grey.500" }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Department</InputLabel>
                <Select
                  value={filterDept}
                  label="Department"
                  onChange={(e) => setFilterDept(e.target.value)}
                >
                  {departments.map((d) => (
                    <MenuItem key={d} value={d}>
                      {d}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {leaveTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {tab === 4 && (
              <>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Month</InputLabel>
                    <Select
                      value={allFilterMonth}
                      label="Month"
                      onChange={(e) => setAllFilterMonth(e.target.value)}
                    >
                      {months.map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={2}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={allFilterStatus}
                      label="Status"
                      onChange={(e) => setAllFilterStatus(e.target.value)}
                    >
                      {["All", "Pending", "Approved", "Rejected"].map((s) => (
                        <MenuItem key={s} value={s}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={4} textAlign="right">
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{ mr: 1, color: COLORS.primary, borderColor: COLORS.primary }}
                onClick={() => {
                  setSearch("");
                  setFilterDept("All");
                  setFilterType("All");
                  if (tab === 4) {
                    setAllFilterMonth("All");
                    setAllFilterStatus("All");
                  }
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={() => exportCSV(filteredRequests)}
                startIcon={<DownloadIcon />}
                sx={{
                  backgroundColor: COLORS.support,
                  "&:hover": { backgroundColor: COLORS.primary },
                }}
              >
                Export CSV
              </Button>
            </Grid>
          </Grid>

          {/* Table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Requested</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>
                        <Typography fontWeight={700}>
                          {r.employeeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {r.employeeId}
                        </Typography>
                      </TableCell>
                      <TableCell>{r.dept}</TableCell>
                      <TableCell>
                        <Chip
                          label={r.type}
                          size="small"
                          sx={{ backgroundColor: COLORS.softBlue }}
                        />
                      </TableCell>
                      <TableCell>
                        {format(parseISO(r.startDate), "dd MMM yyyy")} →{" "}
                        {format(parseISO(r.endDate), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>{r.days}</TableCell>
                      <TableCell>
                        <Chip label={r.status} size="small" />
                      </TableCell>
                      <TableCell>
                        {format(parseISO(r.createdAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openDetail(r)}
                          sx={{
                            borderColor: COLORS.primary,
                            color: COLORS.primary,
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredRequests.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {tab === 3 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" color={COLORS.primary} sx={{ mb: 2 }}>
            Leave Balances
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Annual Allocated</TableCell>
                  <TableCell>Used</TableCell>
                  <TableCell>Remaining</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {balances.map((b) => (
                  <TableRow key={b.employeeId}>
                    <TableCell>
                      <Typography fontWeight={700}>{b.employeeName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {b.employeeId}
                      </Typography>
                    </TableCell>
                    <TableCell>{b.annual}</TableCell>
                    <TableCell>{b.usedAnnual}</TableCell>
                    <TableCell>{Math.max(0, b.annual - b.usedAnnual)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tab === 5 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" color={COLORS.primary} sx={{ mb: 2 }}>
            Leave Calendar
          </Typography>
          {calendarEntries.length === 0 && (
            <Typography>No scheduled leaves.</Typography>
          )}
          <Stack spacing={2}>
            {calendarEntries.map((e) => (
              <Paper key={e.date} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {format(parseISO(e.date), "EEEE, dd MMM yyyy")}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {e.items.map((r) => (
                    <Paper key={r.id} sx={{ p: 1, borderRadius: 1, minWidth: 220 }}>
                      <Typography fontWeight={700}>{r.employeeName}</Typography>
                      <Typography variant="caption">
                        {r.type} • {r.days} days
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                        {r.reason}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                        <Button size="small" onClick={() => openDetail(r)}>
                          View
                        </Button>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      <Dialog open={detailOpen} onClose={closeDetail} fullWidth maxWidth="sm">
        <DialogTitle>Leave Details</DialogTitle>
        <DialogContent dividers>
          {!selectedRequest ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box>
              <Typography variant="h6" color={COLORS.primary} fontWeight={700}>
                {selectedRequest.employeeName} ({selectedRequest.employeeId})
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {selectedRequest.dept}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography>
                <strong>Type:</strong> {selectedRequest.type}
              </Typography>
              <Typography>
                <strong>Duration:</strong>{" "}
                {format(parseISO(selectedRequest.startDate), "dd MMM yyyy")} →{" "}
                {format(parseISO(selectedRequest.endDate), "dd MMM yyyy")}
              </Typography>
              <Typography>
                <strong>Days:</strong> {selectedRequest.days}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selectedRequest.status}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                <strong>Reason:</strong> {selectedRequest.reason}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
