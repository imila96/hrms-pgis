// src/components/HrDashboard/LeaveManagement.js (refactored)
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
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { format, isWithinInterval, parseISO } from "date-fns";

// Keep project color palette (from HrDashboard)
const COLORS = {
  primary: "#4B49AC",
  softBlue: "#98BDFF",
  support: "#7DA0FA",
  alt: "#7978E9",
  accent: "#F3797E",
  bg: "#F5F7FF",
};

// --- Mock data (replace with API responses when ready) ---

const MOCK_LEAVE_REQUESTS = [
  {
    id: 1,
    employeeId: "EMP001",
    employeeName: "Alice Perera",
    dept: "Computer Science",
    type: "Annual",
    startDate: "2025-11-10",
    endDate: "2025-11-14",
    days: 5,
    reason: "Conference attendance",
    status: "Pending",
    createdAt: "2025-10-15",
    attachmentUrl: null,
  },
  {
    id: 2,
    employeeId: "EMP002",
    employeeName: "Bimal Jayasuriya",
    dept: "Mathematics",
    type: "Medical",
    startDate: "2025-10-20",
    endDate: "2025-10-22",
    days: 3,
    reason: "Medical certificate provided",
    status: "Approved",
    createdAt: "2025-10-18",
    attachmentUrl: null,
  },
  {
    id: 3,
    employeeId: "EMP003",
    employeeName: "C. Fernando",
    dept: "Admin",
    type: "Casual",
    startDate: "2025-11-03",
    endDate: "2025-11-03",
    days: 1,
    reason: "Personal work",
    status: "Pending",
    createdAt: "2025-10-28",
    attachmentUrl: null,
  },
  {
    id: 4,
    employeeId: "EMP004",
    employeeName: "Dinesh Silva",
    dept: "Physics",
    type: "Annual",
    startDate: "2025-12-01",
    endDate: "2025-12-10",
    days: 8,
    reason: "Family travel",
    status: "Rejected",
    createdAt: "2025-10-14",
    attachmentUrl: null,
  },
];

const MOCK_LEAVE_BALANCES = [
  {
    employeeId: "EMP001",
    employeeName: "Alice Perera",
    annual: 14,
    usedAnnual: 5,
  },
  {
    employeeId: "EMP002",
    employeeName: "Bimal Jayasuriya",
    annual: 21,
    usedAnnual: 12,
  },
  {
    employeeId: "EMP003",
    employeeName: "C. Fernando",
    annual: 14,
    usedAnnual: 2,
  },
  {
    employeeId: "EMP004",
    employeeName: "Dinesh Silva",
    annual: 14,
    usedAnnual: 0,
  },
];

export default function LeaveManagement() {
  // Data (start with mock; replace with api calls if you want)
  const [requests, setRequests] = useState(MOCK_LEAVE_REQUESTS);
  const [balances, setBalances] = useState(MOCK_LEAVE_BALANCES);

  // UI state
  const [tab, setTab] = useState(0); // 0: Pending,1 Approved,2 Rejected,3 Balances,4 Calendar
  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [decisionComment, setDecisionComment] = useState("");

  // Apply leave dialog state (HR can apply leave on behalf of an employee)
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyEmployeeId, setApplyEmployeeId] = useState("");
  const [applyEmployeeName, setApplyEmployeeName] = useState("");
  const [applyDept, setApplyDept] = useState("");
  const [applyType, setApplyType] = useState("");
  const [applyStart, setApplyStart] = useState("");
  const [applyEnd, setApplyEnd] = useState("");
  const [applyDays, setApplyDays] = useState(1);
  const [applyReason, setApplyReason] = useState("");
  // Filters specific to the 'All' tab
  const [allFilterMonth, setAllFilterMonth] = useState("All");
  const [allFilterStatus, setAllFilterStatus] = useState("All");

  // Derived lists
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
      } catch (e) {
        /* ignore */
      }
    });
    return ["All", ...Array.from(s).sort().reverse()];
  }, [requests]);

  // Table filter by current tab
  const filteredRequests = useMemo(() => {
    let list = requests.slice();
    // status-specific tabs
    if (tab === 0) list = list.filter((r) => r.status === "Pending");
    if (tab === 1) list = list.filter((r) => r.status === "Approved");
    if (tab === 2) list = list.filter((r) => r.status === "Rejected");

    // All-tab (index 4) extra filters will be applied below if set
    if (tab === 4) {
      if (allFilterStatus && allFilterStatus !== "All")
        list = list.filter((r) => r.status === allFilterStatus);
      if (allFilterMonth && allFilterMonth !== "All")
        list = list.filter((r) => {
          try {
            return format(parseISO(r.startDate), "yyyy-MM") === allFilterMonth;
          } catch (e) {
            return false;
          }
        });
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

    list = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return list;
  }, [
    requests,
    tab,
    filterDept,
    filterType,
    search,
    allFilterMonth,
    allFilterStatus,
  ]);

  // summary counts
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

  // pagination handlers
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // detail modal
  function openDetail(request) {
    setSelectedRequest(request);
    setDecisionComment("");
    setDetailOpen(true);
  }
  function closeDetail() {
    setSelectedRequest(null);
    setDetailOpen(false);
  }

  // Apply leave handlers
  function closeApply() {
    setApplyOpen(false);
    setApplyEmployeeId("");
    setApplyEmployeeName("");
    setApplyDept("");
    setApplyType("");
    setApplyStart("");
    setApplyEnd("");
    setApplyDays(1);
    setApplyReason("");
  }

  function submitApply() {
    // simple create new request locally
    const nextId = requests.length
      ? Math.max(...requests.map((r) => r.id)) + 1
      : 1;
    let days = applyDays;
    try {
      if (applyStart && applyEnd) {
        const s = parseISO(applyStart);
        const e = parseISO(applyEnd);
        const diff = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
        days = diff > 0 ? diff : days;
      }
    } catch (e) {
      // ignore and use provided applyDays
    }

    const newReq = {
      id: nextId,
      employeeId: applyEmployeeId || `EMP${String(nextId).padStart(3, "0")}`,
      employeeName: applyEmployeeName || "(Unknown)",
      dept: applyDept || "-",
      type: applyType || "Annual",
      startDate: applyStart || new Date().toISOString().slice(0, 10),
      endDate: applyEnd || new Date().toISOString().slice(0, 10),
      days,
      reason: applyReason,
      status: "Pending",
      createdAt: new Date().toISOString().slice(0, 10),
      attachmentUrl: null,
    };

    setRequests((prev) => [newReq, ...prev]);
    closeApply();
  }

  // Approve / Reject actions (update local state; keep hooks for backend integration)
  function applyDecision(requestId, newStatus, comment) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId ? { ...r, status: newStatus, hrComment: comment } : r
      )
    );

    if (newStatus === "Approved") {
      const req = requests.find((r) => r.id === requestId);
      if (req) {
        setBalances((prev) =>
          prev.map((b) =>
            b.employeeId === req.employeeId
              ? { ...b, usedAnnual: b.usedAnnual + req.days }
              : b
          )
        );
      }
    }

    // TODO: call backend to persist decision
    closeDetail();
  }

  // export visible requests to CSV
  function exportCSV(rows) {
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
    a.download = `leave_requests_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // calendar entries
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

  // EFFECT: placeholder to fetch real data if needed
  useEffect(() => {
    // Replace with API calls if you want real data (axiosInstance)
    // e.g. axiosInstance.get('/leave').then(res => setRequests(res.data))
  }, []);

  return (
    <Box sx={{ p: 3, background: COLORS.bg, minHeight: "80vh" }}>
      {/* Page header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
            Leave Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review and manage employee leave requests — approve, reject, and
            keep leave balances up to date.
          </Typography>
        </Box>

        {/* header action area removed (Export visible CSV / Open Calendar) - replaced with Apply Leave button placed next to summary cards */}
      </Stack>

      {/* Summary cards + Apply Leave button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Grid container spacing={2} sx={{ flex: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Total Requests
              </Typography>
              <Typography variant="h4" fontWeight={700} color={COLORS.primary}>
                {summary.total}
              </Typography>
              <Typography variant="caption">All time</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Pending Approvals
              </Typography>
              <Typography variant="h4" fontWeight={700} color={COLORS.alt}>
                {summary.pending}
              </Typography>
              <Typography variant="caption">Needs review</Typography>
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
              <Typography variant="caption">As of now</Typography>
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
              <Typography variant="caption">Current</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ ml: 2 }}>
          <Button
            variant="contained"
            onClick={() => setApplyOpen(true)}
            sx={{
              backgroundColor: COLORS.primary,
              color: "#fff",
              "&:hover": { backgroundColor: COLORS.alt },
            }}
          >
            Apply Leave
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          indicatorColor="primary"
          textColor="primary"
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600 },
            "& .Mui-selected": { color: COLORS.primary },
          }}
        >
          <Tab label={`Pending (${summary.pending})`} />
          <Tab label={`Approved (${summary.approved})`} />
          <Tab label={`Rejected (${summary.rejected})`} />
          <Tab label="Balances" />
          <Tab label="All" />
          <Tab label="Calendar" />
        </Tabs>
      </Paper>

      {/* Tab contents */}
      {(tab <= 2 || tab === 4) && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {/* Filters and search */}
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

            {/* Additional filters for the All tab: Month and Status */}
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
                sx={{
                  mr: 1,
                  color: COLORS.primary,
                  borderColor: COLORS.primary,
                }}
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

          {/* Requests table */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Employee</TableCell>
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
                        <Chip
                          label={r.status}
                          size="small"
                          sx={{
                            backgroundColor:
                              r.status === "Pending"
                                ? "#FFF3CD"
                                : r.status === "Approved"
                                ? "#E6FFEA"
                                : "#FFE6E6",
                            color:
                              r.status === "Approved" ? COLORS.primary : "#333",
                            borderRadius: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {format(parseISO(r.createdAt), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="flex-end"
                        >
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

                          {r.status === "Pending" && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={() =>
                                  applyDecision(
                                    r.id,
                                    "Approved",
                                    "Approved by HR"
                                  )
                                }
                                sx={{
                                  backgroundColor: COLORS.support,
                                  "&:hover": {
                                    backgroundColor: COLORS.primary,
                                  },
                                }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() =>
                                  applyDecision(
                                    r.id,
                                    "Rejected",
                                    "Rejected by HR"
                                  )
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                {filteredRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      No requests found.
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
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* BALANCES tab */}
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
                  <TableCell>Actions</TableCell>
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
                    <TableCell>
                      {Math.max(0, b.annual - b.usedAnnual)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() =>
                          alert(
                            `Manual adjust for ${b.employeeName} - implement a modal to modify balances and sync with backend.`
                          )
                        }
                      >
                        Adjust
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* CALENDAR tab */}
      {tab === 5 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" color={COLORS.primary} sx={{ mb: 2 }}>
            Leave Calendar (simple)
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
                    <Paper
                      key={r.id}
                      sx={{ p: 1, borderRadius: 1, minWidth: 220 }}
                    >
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

      {/* Detail Dialog */}
      {/* Apply Leave Dialog (HR can enter leave for another employee) */}
      <Dialog open={applyOpen} onClose={closeApply} fullWidth maxWidth="sm">
        <DialogTitle>Apply Leave for Employee</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Employee ID"
                fullWidth
                size="small"
                value={applyEmployeeId}
                onChange={(e) => setApplyEmployeeId(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Employee Name"
                fullWidth
                size="small"
                value={applyEmployeeName}
                onChange={(e) => setApplyEmployeeName(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Department"
                fullWidth
                size="small"
                value={applyDept}
                onChange={(e) => setApplyDept(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Type</InputLabel>
                <Select
                  value={applyType}
                  label="Type"
                  onChange={(e) => setApplyType(e.target.value)}
                >
                  {leaveTypes
                    .filter((t) => t !== "All")
                    .map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={applyStart}
                onChange={(e) => setApplyStart(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="End Date"
                type="date"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={applyEnd}
                onChange={(e) => setApplyEnd(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Reason"
                fullWidth
                size="small"
                multiline
                minRows={3}
                value={applyReason}
                onChange={(e) => setApplyReason(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeApply}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitApply}
            sx={{ backgroundColor: COLORS.support, color: "#fff" }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={detailOpen} onClose={closeDetail} fullWidth maxWidth="sm">
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent dividers>
          {!selectedRequest ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography
                    variant="h6"
                    color={COLORS.primary}
                    fontWeight={700}
                  >
                    {selectedRequest.employeeName}{" "}
                    <Typography component="span" color="text.secondary">
                      ({selectedRequest.employeeId})
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedRequest.dept} • {selectedRequest.reason}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography>{selectedRequest.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Requested</Typography>
                  <Typography>
                    {format(parseISO(selectedRequest.createdAt), "dd MMM yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">From</Typography>
                  <Typography>
                    {format(parseISO(selectedRequest.startDate), "dd MMM yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">To</Typography>
                  <Typography>
                    {format(parseISO(selectedRequest.endDate), "dd MMM yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Days</Typography>
                  <Typography>{selectedRequest.days}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Reason</Typography>
                  <Typography>{selectedRequest.reason}</Typography>
                </Grid>
                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Attachment</Typography>
                  {selectedRequest.attachmentUrl ? (
                    <Button
                      size="small"
                      href={selectedRequest.attachmentUrl}
                      target="_blank"
                    >
                      Open
                    </Button>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      No attachment provided
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="HR Comment (optional)"
                    fullWidth
                    multiline
                    minRows={2}
                    value={decisionComment}
                    onChange={(e) => setDecisionComment(e.target.value)}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
          {selectedRequest && selectedRequest.status === "Pending" && (
            <>
              <Button
                onClick={() =>
                  applyDecision(
                    selectedRequest.id,
                    "Rejected",
                    decisionComment || "Rejected"
                  )
                }
                startIcon={<CancelOutlinedIcon />}
                sx={{
                  color: "#fff",
                  backgroundColor: "#ef5350",
                  "&:hover": { backgroundColor: "#f44336" },
                }}
                variant="contained"
              >
                Reject
              </Button>
              <Button
                onClick={() =>
                  applyDecision(
                    selectedRequest.id,
                    "Approved",
                    decisionComment || "Approved"
                  )
                }
                startIcon={<CheckCircleOutlineIcon />}
                sx={{
                  color: "#fff",
                  backgroundColor: COLORS.support,
                  "&:hover": { backgroundColor: COLORS.primary },
                }}
                variant="contained"
              >
                Approve
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
