/**
 * Leave.js - Employee Leave Management
 * 
 * Enhanced employee-facing leave management matching HR dashboard design.
 * Features:
 * - Leave balance overview by category
 * - Tabbed interface (All, Pending, Approved, Rejected, Calendar)
 * - Apply for leave functionality
 * - Search and filter capabilities
 * - Export to CSV
 * - Detailed leave request views
 */

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
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import DownloadIcon from "@mui/icons-material/Download";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { format, parseISO, isWithinInterval, differenceInDays } from "date-fns";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";
import SriLankanDatePicker from "../common/SriLankanDatePicker";
import { calculateWorkingDays, getHolidaysForYear } from "../../utils/sriLankanHolidays";

// Color palette matching HR dashboard
const COLORS = {
  primary: "#4B49AC",
  softBlue: "#98BDFF",
  support: "#7DA0FA",
  alt: "#7978E9",
  accent: "#F3797E",
  bg: "#F5F7FF",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
};

const LEAVE_TYPE_LABEL_ID = "employee-leave-type-label";
const LEAVE_TYPE_SELECT_ID = "employee-leave-type";

const leaveTypes = [
  { label: "Annual Leave", value: "ANNUAL" },
  { label: "Sick Leave", value: "SICK" },
  { label: "Casual Leave", value: "CASUAL" },
];

const statusColor = (s) =>
  s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

export default function Leave() {
  // Data state
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [tab, setTab] = useState(0); // 0: All, 1: Pending, 2: Approved, 3: Rejected, 4: Calendar
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterMonth, setFilterMonth] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Apply leave dialog
  const [applyOpen, setApplyOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newLeave, setNewLeave] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });
  
  // Calculate working days and holidays for the selected date range
  const leaveDaysInfo = useMemo(() => {
    if (!newLeave.startDate || !newLeave.endDate) {
      return null;
    }
    
    try {
      return calculateWorkingDays(newLeave.startDate, newLeave.endDate);
    } catch (e) {
      return null;
    }
  }, [newLeave.startDate, newLeave.endDate]);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  // Withdraw confirmation dialog
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawingLeave, setWithdrawingLeave] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    severity: "success",
  });

  const loadBalances = async () => {
    try {
      const { data } = await axiosInstance.get("/leave/balance");
      
      console.log("Leave balance API response:", data); // Debug log
      
      // Ensure all leave types are present in the balance data
      const leaveTypesList = ["ANNUAL", "SICK", "CASUAL"];
      const completeBalances = leaveTypesList.map(type => {
        const existing = data?.find(b => b.type === type);
        if (existing) {
          // Map 'taken' to 'used' for consistency with our component
          return {
            type: existing.type,
            entitled: existing.entitled || 0,
            used: existing.taken || 0,
            remaining: existing.remaining || 0
          };
        }
        // If type is missing from API response, create a default entry
        return {
          type: type,
          entitled: 0,
          used: 0,
          remaining: 0
        };
      });
      
      console.log("Processed balances:", completeBalances); // Debug log
      setBalances(completeBalances);
    } catch (error) {
      console.error("Error loading leave balances:", error); // Debug log
      // If API fails, show all types with zero values
      setBalances([
        { type: "ANNUAL", entitled: 0, used: 0, remaining: 0 },
        { type: "SICK", entitled: 0, used: 0, remaining: 0 },
        { type: "CASUAL", entitled: 0, used: 0, remaining: 0 }
      ]);
      setSnack({
        open: true,
        msg: "Failed to load leave balances",
        severity: "error",
      });
    }
  };

  const loadMyLeaves = async () => {
    try {
      const { data } = await axiosInstance.get("/leave/my");
      console.log("My leaves API response:", data); // Debug log
      setLeaves(data || []);
    } catch (error) {
      console.error("Error loading my leaves:", error); // Debug log
      setLeaves([]);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadBalances(), loadMyLeaves()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived data
  const leaveTypeOptions = useMemo(
    () => ["All", ...Array.from(new Set(leaves.map((l) => l.type)))],
    [leaves]
  );

  const months = useMemo(() => {
    const s = new Set();
    leaves.forEach((l) => {
      try {
        s.add(format(parseISO(l.start), "yyyy-MM"));
      } catch (e) {
        /* ignore */
      }
    });
    return ["All", ...Array.from(s).sort().reverse()];
  }, [leaves]);

  // Summary counts
  const summary = useMemo(
    () => ({
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "PENDING").length,
      approved: leaves.filter((l) => l.status === "APPROVED").length,
      rejected: leaves.filter((l) => l.status === "REJECTED").length,
      onLeaveToday: leaves.filter((l) => {
        try {
          return isWithinInterval(new Date(), {
            start: parseISO(l.start),
            end: parseISO(l.end),
          });
        } catch {
          return false;
        }
      }).length,
    }),
    [leaves]
  );

  // Filtered leaves based on tab and filters
  const filteredLeaves = useMemo(() => {
    let list = leaves.slice();

    // Tab filtering
    if (tab === 1) list = list.filter((l) => l.status === "PENDING");
    if (tab === 2) list = list.filter((l) => l.status === "APPROVED");
    if (tab === 3) list = list.filter((l) => l.status === "REJECTED");

    // Type filter
    if (filterType !== "All") list = list.filter((l) => l.type === filterType);

    // Month filter
    if (filterMonth !== "All") {
      list = list.filter((l) => {
        try {
          return format(parseISO(l.start), "yyyy-MM") === filterMonth;
        } catch {
          return false;
        }
      });
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (l) =>
          l.type.toLowerCase().includes(q) ||
          (l.reason || "").toLowerCase().includes(q)
      );
    }

    // Sort by date (newest first)
    list.sort((a, b) => new Date(b.start) - new Date(a.start));

    return list;
  }, [leaves, tab, filterType, filterMonth, search]);

  // Calendar entries
  const calendarEntries = useMemo(() => {
    const map = {};
    leaves
      .filter((l) => l.status === "APPROVED")
      .forEach((l) => {
        try {
          const start = parseISO(l.start);
          const end = parseISO(l.end);
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const key = format(new Date(d), "yyyy-MM-dd");
            if (!map[key]) map[key] = [];
            map[key].push(l);
          }
        } catch (e) {
          /* ignore */
        }
      });
    const keys = Object.keys(map).sort();
    return keys.map((k) => ({ date: k, items: map[k] }));
  }, [leaves]);

  // Handlers
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleChange = (e) =>
    setNewLeave((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const validateLeaveApplication = () => {
    // Check required fields
    if (!newLeave.type || !newLeave.startDate || !newLeave.endDate) {
      return "Please fill all required fields";
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const startDate = newLeave.startDate;
    const endDate = newLeave.endDate;

    // Validation 1: No past dates
    if (startDate < today) {
      return "Cannot apply for leave with past dates. Start date must be today or in the future.";
    }

    // Validation: End date must be after or equal to start date
    if (endDate < startDate) {
      return "End date cannot be before start date.";
    }

    // Calculate requested days excluding holidays
    const workingDaysInfo = calculateWorkingDays(startDate, endDate);
    const requestedDays = workingDaysInfo.workingDays;

    // Validation 2: Check remaining balance
    const balance = balances.find(b => b.type === newLeave.type);
    if (balance && balance.remaining < requestedDays) {
      return `Insufficient leave balance. You have ${balance.remaining} days remaining but requested ${requestedDays} working days (${workingDaysInfo.totalDays} total days - ${workingDaysInfo.holidays} holidays).`;
    }

    // Validation 3: Check for overlapping leaves (approved or pending only)
    const overlappingLeave = leaves.find(leave => {
      if (leave.status === "REJECTED" || leave.status === "CANCELLED") {
        return false; // Skip rejected/cancelled leaves
      }
      
      try {
        const existingStart = leave.start;
        const existingEnd = leave.end;
        
        // Check if dates overlap: !(endDate < existingStart || startDate > existingEnd)
        const overlaps = !(endDate < existingStart || startDate > existingEnd);
        return overlaps;
      } catch (e) {
        return false;
      }
    });

    if (overlappingLeave) {
      const statusText = overlappingLeave.status.toLowerCase();
      return `Leave dates overlap with an existing ${statusText} leave from ${overlappingLeave.start} to ${overlappingLeave.end}`;
    }

    return null; // All validations passed
  };

  const handleSubmit = async () => {
    // Run frontend validations
    const validationError = validateLeaveApplication();
    if (validationError) {
      setSnack({
        open: true,
        msg: validationError,
        severity: "warning",
      });
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post("/leave", {
        startDate: newLeave.startDate,
        endDate: newLeave.endDate,
        type: newLeave.type,
        reason: newLeave.reason?.trim() || null,
      });
      setSnack({
        open: true,
        msg: "Leave application submitted successfully!",
        severity: "success",
      });
      setApplyOpen(false);
      setNewLeave({ type: "", startDate: "", endDate: "", reason: "" });
      await loadData();
    } catch (e) {
      console.error("Error submitting leave:", e); // Debug log
      const errorMsg = e.response?.data?.message || e.response?.data || "Failed to submit leave";
      setSnack({ open: true, msg: errorMsg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  const openDetail = (leave) => {
    setSelectedLeave(leave);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setSelectedLeave(null);
    setDetailOpen(false);
  };

  const openWithdrawDialog = (leave) => {
    setWithdrawingLeave(leave);
    setWithdrawOpen(true);
  };

  const closeWithdrawDialog = () => {
    setWithdrawingLeave(null);
    setWithdrawOpen(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawingLeave) return;

    try {
      setWithdrawing(true);
      await axiosInstance.delete(`/leave/${withdrawingLeave.id}`);
      setSnack({
        open: true,
        msg: "Leave request withdrawn successfully! Balance has been restored.",
        severity: "success",
      });
      closeWithdrawDialog();
      await loadData(); // Reload both leaves and balances
    } catch (e) {
      console.error("Error withdrawing leave:", e);
      const errorMsg = e.response?.data?.message || e.response?.data || "Failed to withdraw leave";
      setSnack({ open: true, msg: errorMsg, severity: "error" });
    } finally {
      setWithdrawing(false);
    }
  };

  const exportCSV = (rows) => {
    const header = [
      "ID",
      "Type",
      "Start Date",
      "End Date",
      "Days",
      "Reason",
      "Status",
    ];
    const csvRows = [header.join(",")];
    rows.forEach((r) => {
      try {
        const days = differenceInDays(parseISO(r.end), parseISO(r.start)) + 1;
        const row = [
          r.id,
          `"${r.type}"`,
          r.start,
          r.end,
          days,
          `"${(r.reason || "").replace(/"/g, '""')}"`,
          r.status,
        ];
        csvRows.push(row.join(","));
      } catch (e) {
        /* ignore malformed rows */
      }
    });
    const csv = csvRows.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my_leaves_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const calculateDays = (start, end) => {
    try {
      const result = calculateWorkingDays(start, end);
      return result.workingDays;
    } catch {
      return 0;
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          height: 400,
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        <CircularProgress size={60} sx={{ color: COLORS.primary }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        background: COLORS.bg,
        minHeight: "80vh",
        animation: "slideUp 0.4s ease-out",
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <BackButton />

      {/* Header */}
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

        <Button
          variant="contained"
          onClick={() => setApplyOpen(true)}
          startIcon={<AddCircleOutlineIcon />}
          sx={{
            backgroundColor: COLORS.primary,
            color: "#fff",
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(75,73,172,0.3)",
            "&:hover": {
              backgroundColor: COLORS.alt,
              transform: "translateY(-2px)",
              boxShadow: "0 6px 16px rgba(75,73,172,0.4)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Apply Leave
        </Button>
      </Stack>

      {/* Leave Balance Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {balances.map((b) => {
          const usedPercentage = b.entitled > 0 ? (b.used / b.entitled) * 100 : 0;
          const leaveTypeLabel = 
            b.type === "ANNUAL" ? "Annual Leave" :
            b.type === "SICK" ? "Sick Leave" :
            b.type === "CASUAL" ? "Casual Leave" :
            b.type;
          
          return (
            <Grid item xs={12} sm={6} md={4} key={b.type}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 4px 20px rgba(75,73,172,0.15)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <EventAvailableIcon sx={{ color: COLORS.support }} />
                    <Typography variant="subtitle2" fontWeight={600}>
                      {leaveTypeLabel}
                    </Typography>
                  </Stack>

                  <Typography variant="h4" fontWeight={700} color={COLORS.primary}>
                    {b.remaining}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    days remaining out of {b.entitled}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(usedPercentage, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      backgroundColor: "#E0E7FF",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          usedPercentage > 80
                            ? COLORS.accent
                            : usedPercentage > 50
                            ? COLORS.warning
                            : COLORS.success,
                        borderRadius: 1,
                      },
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {b.used} used • {usedPercentage.toFixed(0)}% consumed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
            <HourglassEmptyIcon sx={{ color: COLORS.warning, fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700} color={COLORS.warning}>
              {summary.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending Approval
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
            <CheckCircleIcon sx={{ color: COLORS.success, fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700} color={COLORS.success}>
              {summary.approved}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Approved
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
            <CancelIcon sx={{ color: COLORS.error, fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700} color={COLORS.error}>
              {summary.rejected}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Rejected
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2, textAlign: "center" }}>
            <EventAvailableIcon sx={{ color: COLORS.accent, fontSize: 40 }} />
            <Typography variant="h4" fontWeight={700} color={COLORS.accent}>
              {summary.onLeaveToday}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              On Leave Today
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Upcoming Holidays Section */}
      <Paper
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          boxShadow: "0 4px 20px rgba(240, 147, 251, 0.15)",
          background: 'linear-gradient(to bottom, #ffffff, #fff5fd)',
          border: '1px solid #ffe6f9',
        }}
      >
        <Typography 
          variant="h6" 
          fontWeight={700} 
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          🇱🇰 Upcoming Public Holidays
        </Typography>
        <Grid container spacing={2}>
          {getUpcomingSriLankanHolidays().slice(0, 5).map((holiday, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #ffeaf6 0%, #fff5fd 100%)',
                  borderLeft: "3px solid #f093fb",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: 'linear-gradient(135deg, #ffd9f0 0%, #ffeaf6 100%)',
                    transform: "translateY(-4px)",
                    boxShadow: "0 6px 16px rgba(240, 147, 251, 0.3)",
                  },
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight={600} 
                  color="#c2185b" 
                  sx={{ fontSize: '0.9rem', mb: 1 }}
                  noWrap
                >
                  {holiday.name}
                </Typography>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                    {holiday.date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Typography>
                  <Chip
                    label={`${holiday.daysUntil}d`}
                    size="small"
                    sx={{
                      bgcolor: holiday.daysUntil <= 7 ? "#f5576c22" : "#f093fb22",
                      color: holiday.daysUntil <= 7 ? "#f5576c" : "#f093fb",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      height: 22,
                    }}
                  />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

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
          <Tab label={`All (${summary.total})`} />
          <Tab label={`Pending (${summary.pending})`} />
          <Tab label={`Approved (${summary.approved})`} />
          <Tab label={`Rejected (${summary.rejected})`} />
          <Tab label="Calendar" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {tab <= 3 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {/* Filters */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search by type or reason..."
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
                <InputLabel>Type</InputLabel>
                <Select
                  value={filterType}
                  label="Type"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  {leaveTypeOptions.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Month</InputLabel>
                <Select
                  value={filterMonth}
                  label="Month"
                  onChange={(e) => setFilterMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <MenuItem key={m} value={m}>
                      {m}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

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
                  setFilterType("All");
                  setFilterMonth("All");
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={() => exportCSV(filteredLeaves)}
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
                  <TableCell sx={{ fontWeight: 700 }}>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredLeaves
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Chip
                          label={row.type}
                          size="small"
                          sx={{ backgroundColor: COLORS.softBlue }}
                        />
                      </TableCell>
                      <TableCell>
                        {format(parseISO(row.start), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(row.end), "dd MMM yyyy")}
                      </TableCell>
                      <TableCell>
                        {calculateDays(row.start, row.end)}
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={row.reason || "—"}
                        >
                          {row.reason || "—"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.status}
                          color={statusColor(row.status)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => openDetail(row)}
                            sx={{
                              borderColor: COLORS.primary,
                              color: COLORS.primary,
                            }}
                          >
                            View
                          </Button>
                          
                          {/* Show withdraw button only for PENDING or APPROVED leaves */}
                          {(row.status === "PENDING" || row.status === "APPROVED") && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => openWithdrawDialog(row)}
                              sx={{
                                borderColor: COLORS.error,
                                color: COLORS.error,
                              }}
                            >
                              Withdraw
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

                {filteredLeaves.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No leave records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredLeaves.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      {/* Calendar Tab */}
      {tab === 4 && (
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="h6" color={COLORS.primary} sx={{ mb: 2 }}>
            Leave Calendar (Approved Leaves)
          </Typography>

          {calendarEntries.length === 0 && (
            <Typography>No approved leaves scheduled.</Typography>
          )}

          <Stack spacing={2}>
            {calendarEntries.map((e) => (
              <Paper key={e.date} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {format(parseISO(e.date), "EEEE, dd MMM yyyy")}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  {e.items.map((l) => (
                    <Paper
                      key={l.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        minWidth: 220,
                        backgroundColor: COLORS.bg,
                      }}
                    >
                      <Typography fontWeight={700}>{l.type}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {calculateDays(l.start, l.end)} days
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                        {l.reason || "No reason provided"}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => openDetail(l)}
                        sx={{ mt: 1 }}
                      >
                        View Details
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Apply Leave Dialog */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Apply for Leave</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
  <FormControl fullWidth size="small" variant="outlined">
    <InputLabel id={LEAVE_TYPE_LABEL_ID} shrink>
      Leave Type *
    </InputLabel>
    <Select
      labelId={LEAVE_TYPE_LABEL_ID}
      id={LEAVE_TYPE_SELECT_ID}
      name="type"
      value={newLeave.type}
      label="Leave Type *"
      onChange={handleChange}
      displayEmpty
      renderValue={(v) =>
        v
          ? (leaveTypes.find(t => t.value === v)?.label ?? v)
          : <span style={{ color: 'rgba(0,0,0,0.6)' }}>Select leave type</span>
      }
    >
      <MenuItem value="">
        <em>Select leave type</em>
      </MenuItem>
      {leaveTypes.map(t => (
        <MenuItem key={t.value} value={t.value}>
          {t.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Grid>


            <Grid item xs={12} md={6}>
              <SriLankanDatePicker
                label="Start Date *"
                name="startDate"
                value={newLeave.startDate}
                onChange={handleChange}
                minDate={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SriLankanDatePicker
                label="End Date *"
                name="endDate"
                value={newLeave.endDate}
                onChange={handleChange}
                minDate={newLeave.startDate || format(new Date(), "yyyy-MM-dd")}
                required
              />
            </Grid>
            
            {/* Show holiday and working days calculation */}
            {leaveDaysInfo && (
              <Grid item xs={12}>
                <Paper 
                  sx={{ 
                    p: 2, 
                    backgroundColor: '#F5F7FF',
                    borderRadius: 2,
                    border: '1px solid #E0E7FF'
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Leave Duration Calculation
                  </Typography>
                  
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Total Days
                      </Typography>
                      <Typography variant="h6" fontWeight={700}>
                        {leaveDaysInfo.totalDays}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Holidays
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color="warning.main">
                        {leaveDaysInfo.holidays}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="caption" color="text.secondary">
                        Working Days
                      </Typography>
                      <Typography variant="h6" fontWeight={700} color={COLORS.primary}>
                        {leaveDaysInfo.workingDays}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  {leaveDaysInfo.holidays > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        Holidays in this period:
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        {leaveDaysInfo.holidaysList.map((holiday, idx) => (
                          <Chip
                            key={idx}
                            label={`${format(parseISO(holiday.date), "MMM dd")} - ${holiday.name}`}
                            size="small"
                            sx={{ 
                              mr: 0.5, 
                              mb: 0.5,
                              backgroundColor: '#FFF9E6',
                              color: '#F57C00',
                              fontWeight: 500
                            }}
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                        ℹ️ Public holidays are automatically excluded from your leave count
                      </Typography>
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 1.5 }} />
                  
                  <Typography variant="body2" color="text.secondary">
                    You will use <strong style={{ color: COLORS.primary }}>{leaveDaysInfo.workingDays} leave days</strong> for this period
                  </Typography>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                label="Reason (optional)"
                name="reason"
                fullWidth
                size="small"
                multiline
                minRows={3}
                value={newLeave.reason}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            sx={{ backgroundColor: COLORS.support, color: "#fff" }}
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onClose={closeDetail} fullWidth maxWidth="sm">
        <DialogTitle>Leave Request Details</DialogTitle>
        <DialogContent dividers>
          {!selectedLeave ? (
            <Typography>Loading...</Typography>
          ) : (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Type</Typography>
                  <Typography fontWeight={600}>{selectedLeave.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip
                    label={selectedLeave.status}
                    color={statusColor(selectedLeave.status)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2">From</Typography>
                  <Typography>
                    {format(parseISO(selectedLeave.start), "dd MMM yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2">To</Typography>
                  <Typography>
                    {format(parseISO(selectedLeave.end), "dd MMM yyyy")}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2">Duration</Typography>
                  <Typography>
                    {calculateDays(selectedLeave.start, selectedLeave.end)} days
                  </Typography>
                </Grid>

                <Grid item xs={12} sx={{ mt: 1 }}>
                  <Typography variant="subtitle2">Reason</Typography>
                  <Typography>{selectedLeave.reason || "No reason provided"}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={withdrawOpen} onClose={closeWithdrawDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: COLORS.error }}>
          Withdraw Leave Request?
        </DialogTitle>
        <DialogContent dividers>
          {withdrawingLeave && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to withdraw this leave request?
              </Typography>
              
              <Box sx={{ bgcolor: COLORS.bg, p: 2, borderRadius: 1, mb: 2 }}>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Leave Type
                    </Typography>
                    <Typography fontWeight={600}>{withdrawingLeave.type}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={withdrawingLeave.status}
                      color={statusColor(withdrawingLeave.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      From
                    </Typography>
                    <Typography>
                      {format(parseISO(withdrawingLeave.start), "dd MMM yyyy")}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      To
                    </Typography>
                    <Typography>
                      {format(parseISO(withdrawingLeave.end), "dd MMM yyyy")}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography>
                      {calculateDays(withdrawingLeave.start, withdrawingLeave.end)} days
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Alert severity="info" sx={{ mb: 2 }}>
                {withdrawingLeave.status === "APPROVED" 
                  ? "This leave was already approved. Withdrawing it will restore your leave balance."
                  : "Your leave balance will be updated accordingly."}
              </Alert>

              <Typography variant="body2" color="text.secondary">
                This action cannot be undone. You'll need to submit a new request if you change your mind.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeWithdrawDialog} disabled={withdrawing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleWithdraw}
            disabled={withdrawing}
            sx={{ 
              backgroundColor: COLORS.error,
              "&:hover": { backgroundColor: "#d32f2f" }
            }}
          >
            {withdrawing ? "Withdrawing..." : "Yes, Withdraw"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          sx={{ width: "100%", borderRadius: 2, fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Helper function to get upcoming Sri Lankan public holidays
function getUpcomingSriLankanHolidays() {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Get holidays from the centralized utility for current and next year
  const currentYearHolidays = getHolidaysForYear(currentYear);
  const nextYearHolidays = getHolidaysForYear(currentYear + 1);
  
  // Combine and convert to required format
  const allHolidays = [
    ...currentYearHolidays.map(h => ({
      name: h.name,
      date: new Date(h.date),
      daysUntil: Math.ceil((new Date(h.date) - today) / (1000 * 60 * 60 * 24))
    })),
    ...nextYearHolidays.map(h => ({
      name: h.name,
      date: new Date(h.date),
      daysUntil: Math.ceil((new Date(h.date) - today) / (1000 * 60 * 60 * 24))
    }))
  ];
  
  // Filter upcoming holidays only and sort by date
  const upcomingHolidays = allHolidays
    .filter(h => h.date >= today)
    .sort((a, b) => a.date - b.date);

  return upcomingHolidays;
}
