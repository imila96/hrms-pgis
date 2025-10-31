// src/components/EmployeeDashboard/Attendance.js
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
  TextField,
  Grid,
  CircularProgress,
  Button,
  Stack,
  Snackbar,
  Alert,
  TableContainer,
  Toolbar,
  Tooltip,
  Chip,
  Divider,
  LinearProgress,
  Skeleton,
  IconButton,
} from "@mui/material";
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  Coffee as CoffeeIcon,
  CoffeeOutlined as CoffeeOutlinedIcon,
  CalendarMonth as CalendarMonthIcon,
  AccessTime as AccessTimeIcon,
  TrendingUp as TrendingUpIcon,
  Summarize as SummarizeIcon,
  Autorenew as AutorenewIcon,
} from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";
import dayjs from "dayjs";

/** ---- Minimal config helper (localStorage-based) ----------------------- */
const CFG_STORAGE_KEY = "system_config";
const CFG_DEFAULTS = {
  allowManualAttendance: true,
  siteTitle: "HR Portal",
  timezone: "Asia/Colombo",
  workdayStart: "09:00",
  workdayEnd: "18:00",
  sessionTimeoutMinutes: 30,
};
const loadConfig = () => {
  try {
    const raw = localStorage.getItem(CFG_STORAGE_KEY) || "{}";
    return { ...CFG_DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return CFG_DEFAULTS;
  }
};
const onConfigChange = (handler) => {
  const fn = () => handler(loadConfig());
  // fired by SystemConfig save()
  window.addEventListener("system-config-change", fn);
  // cross-tab change
  const storageFn = (e) => e.key === CFG_STORAGE_KEY && fn();
  window.addEventListener("storage", storageFn);
  return () => {
    window.removeEventListener("system-config-change", fn);
    window.removeEventListener("storage", storageFn);
  };
};
/** ---------------------------------------------------------------------- */

/** Format minutes -> hours with a chosen number of decimals (default 4). */
const formatHours = (minutes, dp = 4) =>
  (Number(minutes || 0) / 60).toFixed(dp);

/** Compute a display-paid-minutes with ceil + min 1.
 *  Falls back to backend paidMinutes when it’s already >= 1, or when timestamps are missing.
 */
function computeDisplayPaidMinutes(rec) {
  const backend = Number(rec.paidMinutes || 0);
  const breakMin = Number(rec.breakMinutes || 0);

  // If backend already reports >= 1 minute, just use it.
  if (backend >= 1) return backend;

  // Need both times to compute
  if (!rec.firstIn || !rec.lastOut) return backend;

  // Ceil to minutes to credit short sessions
  const diffMinCeil = Math.ceil(
    dayjs(rec.lastOut).diff(dayjs(rec.firstIn), "minute", true) // fractional minutes
  );

  // Subtract break and clamp to >= 1 if the session exists
  const adjusted = Math.max(1, diffMinCeil - breakMin);

  // Never negative
  return Math.max(0, adjusted);
}

/** Normalize a list of records with displayPaidMinutes */
function normalizeRecords(records) {
  return (records || []).map((r) => ({
    ...r,
    displayPaidMinutes: computeDisplayPaidMinutes(r),
  }));
}

const StatCard = ({ icon, label, value, help }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      borderRadius: 3,
      height: "100%",
      bgcolor: (t) => (t.palette.mode === "light" ? "#f8fafc" : "#0b1220"),
      border: (t) => `1px solid ${t.palette.divider}`,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: (t) => (t.palette.mode === "light" ? "#eef2ff" : "#111827"),
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        {icon}
      </Box>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
    </Stack>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
    {help && (
      <Typography variant="caption" color="text.secondary">
        {help}
      </Typography>
    )}
  </Paper>
);

const Attendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM"));
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);

  // admin config
  const [cfg, setCfg] = useState(loadConfig());

  // punch/state UI
  const [punching, setPunching] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const [state, setState] = useState({
    checkedIn: false,
    onBreak: false,
    canCheckIn: true,
    canBreakOut: false,
    canBreakIn: false,
    canCheckOut: false,
  });

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedMonth]);

  useEffect(() => {
    fetchState();
    const id = setInterval(fetchState, 60000); // keep buttons fresh
    const onVis = () => {
      if (!document.hidden) fetchState();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // listen to admin config changes (Allow Manual Attendance)
  useEffect(() => {
    const off = onConfigChange(setCfg);
    return off;
  }, []);

  const fetchState = async () => {
    try {
      const res = await axiosInstance.get("/attendance/me/state");
      setState(res.data);
    } catch (e) {
      console.error("Failed to fetch attendance state:", e);
    }
  };

  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/attendance/me", {
        params: { month: selectedMonth },
      });

      const normalized = normalizeRecords(data);
      setAttendanceRecords(normalized);
      calculateSummary(normalized);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (records) => {
    // Use displayPaidMinutes so short sessions count as 1 minute
    const presentDays = records.filter((r) => r.displayPaidMinutes > 0).length;
    const absentDays = records.filter((r) => !r.firstIn && !r.lastOut).length;
    const totalPaidMinutes = records.reduce(
      (sum, r) => sum + (r.displayPaidMinutes || 0),
      0
    );
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

  const punch = async (type) => {
    try {
      setPunching(true);
      await axiosInstance.post("/attendance/punch", null, { params: { type } });
      setSnack({
        open: true,
        msg: `${type.replaceAll("_", " ")} done`,
        sev: "success",
      });
      await Promise.all([fetchAttendanceData(), fetchState()]);
    } catch (error) {
      const msg = error?.response?.data?.message || "Punch failed";
      setSnack({ open: true, msg, sev: "error" });
      console.error("Punch error:", error);
    } finally {
      setPunching(false);
    }
  };

  const handleSnackClose = () => setSnack((s) => ({ ...s, open: false }));

  const formatTime = (datetime) =>
    !datetime ? "-" : dayjs(datetime).format("hh:mm A");
  const formatDate = (date) => dayjs(date).format("MMM D, YYYY");

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Page header */}
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 3,
          background: (t) =>
            t.palette.mode === "light"
              ? "linear-gradient(135deg, #f5f7ff 0%, #f0fbff 50%, #f9f9ff 100%)"
              : "linear-gradient(135deg, #0a0f1f 0%, #0a1426 50%, #0a0f1f 100%)",
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between">
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }} gutterBottom>
              My Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cfg.siteTitle} · Timezone: {cfg.timezone}
            </Typography>
          </Box>

          {/* Month Selector + Refresh */}
          <Toolbar disableGutters sx={{ gap: 1 }}>
            <TextField
              label="Select Month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
            />
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={fetchAttendanceData} disabled={loading}>
                  <AutorenewIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Toolbar>
        </Stack>
      </Paper>

      {/* Punch Actions (respect admin config) */}
      {cfg.allowManualAttendance ? (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }} variant="outlined">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Tooltip title="Check In">
              <span>
                <Button
                  disabled={punching || !state.canCheckIn}
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => punch("CHECK_IN")}
                >
                  Check In
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Start Break">
              <span>
                <Button
                  disabled={punching || !state.canBreakOut}
                  variant="outlined"
                  startIcon={<CoffeeIcon />}
                  onClick={() => punch("BREAK_OUT")}
                >
                  Break Out
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="End Break">
              <span>
                <Button
                  disabled={punching || !state.canBreakIn}
                  variant="outlined"
                  startIcon={<CoffeeOutlinedIcon />}
                  onClick={() => punch("BREAK_IN")}
                >
                  Break In
                </Button>
              </span>
            </Tooltip>

            <Tooltip title="Check Out">
              <span>
                <Button
                  disabled={punching || !state.canCheckOut}
                  variant="contained"
                  color="secondary"
                  startIcon={<LogoutIcon />}
                  onClick={() => punch("CHECK_OUT")}
                >
                  Check Out
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }} variant="outlined">
          <Alert severity="info" variant="outlined">
            Manual punches are disabled by admin.
          </Alert>
        </Paper>
      )}

      {/* Summary */}
      {summary && (
        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }} elevation={0}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<CalendarMonthIcon fontSize="small" />}
                label="Present Days"
                value={summary.presentDays}
                help="Days with recorded work"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<SummarizeIcon fontSize="small" />}
                label="Absent Days"
                value={summary.absentDays}
                help="No in/out records"
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<AccessTimeIcon fontSize="small" />}
                label="Total Paid Hours"
                value={`${formatHours(summary.totalPaidMinutes, 2)} hrs`}
                help={`${summary.totalPaidMinutes} mins credited`}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StatCard
                icon={<TrendingUpIcon fontSize="small" />}
                label="Avg Daily Hours"
                value={`${formatHours(summary.avgWorkingMinutes, 2)} hrs`}
                help={`${summary.avgWorkingMinutes} mins/day`}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Loading state indicator */}
      {loading && (
        <Box sx={{ mb: 1 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Records Table */}
      <Paper sx={{ borderRadius: 3 }} variant="outlined">
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rounded" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={40} sx={{ mb: 1 }} />
            <Skeleton variant="rounded" height={40} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>First In</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Last Out</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Break (min)</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Paid (min)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.map((rec) => {
                  const isAbsent = !rec.firstIn && !rec.lastOut;
                  const paid = rec.displayPaidMinutes || 0;
                  return (
                    <TableRow
                      key={rec.workDate}
                      hover
                      sx={{
                        "&:nth-of-type(odd)": {
                          bgcolor: (t) =>
                            t.palette.mode === "light" ? "#fafafa" : "#0c1222",
                        },
                        opacity: isAbsent ? 0.7 : 1,
                      }}
                    >
                      <TableCell>{formatDate(rec.workDate)}</TableCell>
                      <TableCell>{formatTime(rec.firstIn)}</TableCell>
                      <TableCell>{formatTime(rec.lastOut)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={rec.breakMinutes}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {paid > 0 ? (
                          <Chip
                            size="small"
                            color={paid >= 480 ? "success" : paid >= 240 ? "warning" : "default"}
                            label={paid}
                          />
                        ) : (
                          <Chip size="small" color="error" variant="outlined" label={paid} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {attendanceRecords.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ py: 6, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                          No records for this month.
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={handleSnackClose}
      >
        <Alert
          onClose={handleSnackClose}
          severity={snack.sev}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Attendance;
