// src/components/EmployeeDashboard/Complaints.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Snackbar, Alert, Stack, Chip, Box, Card, CardContent,
  CardActions, IconButton, Tooltip, InputAdornment, Divider
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import BugReportIcon from "@mui/icons-material/BugReport";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axiosInstance from "../../AxiosInstance";

const statusChip = (s) => (
  <Chip
    label={s === "RESOLVED" ? "Resolved" : "Pending"}
    size="small"
    color={s === "RESOLVED" ? "success" : "warning"}
    sx={{ fontWeight: 600 }}
  />
);

const fmt = (d) => (d ? new Date(d).toLocaleString() : "-");
const truncate = (s, n = 220) => (s && s.length > n ? s.slice(0, n) + "…" : s || "-");

export default function Complaints() {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", description: "" });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [expanded, setExpanded] = useState({}); // id -> boolean
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params = statusFilter === "ALL" ? {} : { status: statusFilter };
      const { data } = await axiosInstance.get("/issues/my", { params });
      setIssues(data || []);
    } catch (e) {
      setSnack({ open: true, msg: `Failed to load: ${e.response?.status || e.message}`, sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const canSave = useMemo(
    () => newIssue.title.trim().length > 0 && newIssue.description.trim().length > 0,
    [newIssue]
  );

  const onSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await axiosInstance.post("/issues", newIssue);
      setOpen(false);
      setNewIssue({ title: "", description: "" });
      setSnack({ open: true, msg: "Complaint submitted.", sev: "success" });
      await load();
    } catch (e) {
      setSnack({ open: true, msg: `Submit failed: ${e.response?.status || e.message}`, sev: "error" });
    } finally {
      setSaving(false);
    }
  };

  const counts = useMemo(() => ({
    total: issues.length,
    pending: issues.filter(i => i.status === "PENDING").length,
    resolved: issues.filter(i => i.status === "RESOLVED").length
  }), [issues]);

  const filtered = useMemo(() => {
    const qq = q.toLowerCase();
    return issues.filter(i =>
      (i.title || "").toLowerCase().includes(qq) ||
      (i.description || "").toLowerCase().includes(qq)
    );
  }, [issues, q]);

  const FilterChip = ({ value, label, icon }) => (
    <Chip
      icon={icon}
      label={label}
      variant={statusFilter === value ? "filled" : "outlined"}
      color={value === "RESOLVED" ? "success" : value === "PENDING" ? "warning" : "default"}
      onClick={() => setStatusFilter(value)}
      sx={{ fontWeight: 600 }}
    />
  );

  const IssueCard = ({ it }) => {
    const open = !!expanded[it.id];
    const borderColor = it.status === "RESOLVED" ? "success.main" : "warning.main";
    const tint = it.status === "RESOLVED" ? "rgba(76,175,80,0.06)" : "rgba(255,152,0,0.08)";
    return (
      <Card
        elevation={0}
        sx={{
          mb: 1.5, borderRadius: 2, border: "1px solid", borderColor: "divider",
          position: "relative", overflow: "hidden",
          "&:before": { content: '""', position: "absolute", inset: 0, background: `linear-gradient(135deg, ${tint}, transparent)` },
        }}
      >
        <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 6, bgcolor: borderColor }} />
        <CardContent sx={{ pt: 2, pb: 1.5, pl: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
                <BugReportIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{it.title}</Typography>
              {statusChip(it.status)}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Created: {fmt(it.createdAt)}{it.updatedAt && ` • Updated: ${fmt(it.updatedAt)}`}
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ mt: 1.2 }}>
            {open ? (it.description || "-") : truncate(it.description)}
          </Typography>
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", pt: 0, pb: 1.5, px: 2 }}>
          <Stack direction="row" spacing={1}>
            <Chip size="small" variant="outlined" icon={<HourglassBottomIcon fontSize="small" />}
                  label={`${counts.pending} pending`} />
            <Chip size="small" variant="outlined" color="success" icon={<CheckCircleIcon fontSize="small" />}
                  label={`${counts.resolved} resolved`} />
          </Stack>
          <Button
            size="small"
            endIcon={<ExpandMoreIcon sx={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />}
            onClick={() => setExpanded(s => ({ ...s, [it.id]: !open }))}
          >
            {open ? "Show less" : "Read more"}
          </Button>
        </CardActions>
      </Card>
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          p: 2, mb: 2, borderRadius: 3,
          background: "linear-gradient(90deg, rgba(33,150,243,0.12), rgba(76,175,80,0.12))",
          border: "1px solid", borderColor: "divider",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
          <Typography variant="h5" sx={{ fontWeight: 900 }}>
            Complaints / Technical Issues
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <FilterChip value="ALL" label={`All (${counts.total})`} icon={<BugReportIcon />} />
            <FilterChip value="PENDING" label={`Pending (${counts.pending})`} icon={<HourglassBottomIcon />} />
            <FilterChip value="RESOLVED" label={`Resolved (${counts.resolved})`} icon={<CheckCircleIcon />} />
            <TextField
              size="small"
              placeholder="Search title or description…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              sx={{ minWidth: 240, ml: { xs: 0, md: 1 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Refresh">
              <span>
                <IconButton onClick={load} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              sx={{ ml: { xs: 0, md: 1 } }}
            >
              Submit New Complaint
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* List */}
      <Box>
        {filtered.map((it) => <IssueCard key={it.id} it={it} />)}
        {filtered.length === 0 && (
          <Paper variant="outlined" sx={{ p: 3, mt: 1.5, borderRadius: 3, textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>No issues found</Typography>
            <Typography variant="body2" color="text.secondary">
              Try a different filter or submit a new complaint.
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Submit dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Submit Complaint</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            fullWidth label="Title" name="title" value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 120 }}
            helperText={`${newIssue.title.length}/120`}
          />
          <TextField
            fullWidth label="Description" name="description" value={newIssue.description}
            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
            multiline rows={5}
            inputProps={{ maxLength: 2000 }}
            helperText={`${newIssue.description.length}/2000`}
          />
          <Divider sx={{ my: 2 }} />
          <Typography variant="caption" color="text.secondary">
            Tip: include steps to reproduce and any error messages to speed up resolution.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!canSave || saving} variant="contained" onClick={onSubmit}>
            {saving ? "Submitting…" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Paper>
  );
}
