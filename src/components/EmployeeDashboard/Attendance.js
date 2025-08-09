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
} from "@mui/material";
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
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        My Attendance
      </Typography>

      {/* Month Selector */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
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

      {/* Punch Actions (respect admin config) */}
      {cfg.allowManualAttendance ? (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              disabled={punching || !state.canCheckIn}
              variant="contained"
              onClick={() => punch("CHECK_IN")}
            >
              Check In
            </Button>

            <Button
              disabled={punching || !state.canBreakOut}
              variant="outlined"
              onClick={() => punch("BREAK_OUT")}
            >
              Break Out
            </Button>

            <Button
              disabled={punching || !state.canBreakIn}
              variant="outlined"
              onClick={() => punch("BREAK_IN")}
            >
              Break In
            </Button>

            <Button
              disabled={punching || !state.canCheckOut}
              variant="contained"
              color="secondary"
              onClick={() => punch("CHECK_OUT")}
            >
              Check Out
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Alert severity="info" variant="outlined">
            Manual punches are disabled by admin.
          </Alert>
        </Paper>
      )}

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
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
                  Total Paid Hours: {formatHours(summary.totalPaidMinutes, 4)} hrs
                </Grid>
                <Grid item xs={12} sm={3}>
                  Avg Daily Hours: {formatHours(summary.avgWorkingMinutes, 4)} hrs
                </Grid>
              </Grid>
            </Paper>
          )}

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
                    <TableCell>{rec.displayPaidMinutes}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}

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
