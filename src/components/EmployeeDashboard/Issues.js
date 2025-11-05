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
  Divider,
  Alert,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import AddIcon from "@mui/icons-material/Add";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";

const COLORS = {
  primary: "#4B49AC",
  support: "#7DA0FA",
  alt: "#7978E9",
  bg: "#F5F7FF",
};

export default function Issues() {
  const [issues, setIssues] = useState([]);
  const [, setLoading] = useState(true);

  const [tab, setTab] = useState(0); // 0 Pending, 1 Resolved, 2 All
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "TECHNICAL_ISSUE",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [selected, setSelected] = useState(null); // view dialog

  const summary = useMemo(
    () => ({
      total: issues.length,
      pending: issues.filter((c) => c.status === "PENDING").length,
      resolved: issues.filter((c) => c.status === "RESOLVED").length,
      technical: issues.filter((c) => c.type === "TECHNICAL_ISSUE").length,
      complaint: issues.filter((c) => c.type === "COMPLAINT").length,
    }),
    [issues]
  );

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/issues/my");
        if (Array.isArray(res.data)) {
          setIssues(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch issues:", e);
        setSnackbar({
          open: true,
          message: "Failed to load issues. Please try again.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const filtered = useMemo(() => {
    let list = issues.slice();
    if (tab === 0) list = list.filter((c) => c.status === "PENDING");
    if (tab === 1) list = list.filter((c) => c.status === "RESOLVED");
    if (filterStatus !== "All")
      list = list.filter((c) => c.status === filterStatus);
    if (filterType !== "All") list = list.filter((c) => c.type === filterType);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q)
      );
    }
    list.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    return list;
  }, [issues, tab, filterStatus, filterType, search]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openView = (c) => setSelected(c);
  const closeView = () => setSelected(null);

  const openAdd = () => {
    setForm({ title: "", description: "", type: "TECHNICAL_ISSUE" });
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
  };

  const saveNew = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setSnackbar({
        open: true,
        message: "Please fill in all fields",
        severity: "warning",
      });
      return;
    }

    try {
      const res = await axiosInstance.post("/issues", {
        title: form.title.trim(),
        description: form.description.trim(),
        type: form.type,
      });

      setIssues((prev) => [res.data, ...prev]);
      setSnackbar({
        open: true,
        message: "Issue submitted successfully!",
        severity: "success",
      });
      closeDialog();
    } catch (e) {
      console.error("Failed to submit issue:", e);
      setSnackbar({
        open: true,
        message: "Failed to submit issue. Please try again.",
        severity: "error",
      });
    }
  };

  const exportCSV = (rows) => {
    const header = [
      "ID",
      "Title",
      "Description",
      "Type",
      "Status",
      "CreatedAt",
      "UpdatedAt",
      "Remark",
      "UpdatedBy",
    ];
    const csv = [header.join(",")]
      .concat(
        rows.map((r) =>
          [
            r.id,
            `"${(r.title || "").replace(/"/g, '""')}"`,
            `"${(r.description || "").replace(/"/g, '""')}"`,
            r.type || "",
            r.status || "",
            r.createdAt || "",
            r.updatedAt || "",
            `"${(r.remark || "").replace(/"/g, '""')}"`,
            r.updatedBy || "",
          ].join(",")
        )
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_issues_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3, background: COLORS.bg, minHeight: "70vh" }}>
      <BackButton />
      
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
            My Issues & Complaints
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Submit and track your technical issues and complaints.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openAdd}
          sx={{ backgroundColor: COLORS.primary, color: "#fff" }}
        >
          New Issue
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Issues
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.primary}>
              {summary.total}
            </Typography>
            <Typography variant="caption">All time</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.alt}>
              {summary.pending}
            </Typography>
            <Typography variant="caption">Awaiting action</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Resolved
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#4CAF50">
              {summary.resolved}
            </Typography>
            <Typography variant="caption">Closed</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Technical Issues
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#FF9800">
              {summary.technical}
            </Typography>
            <Typography variant="caption">System related</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Complaints
            </Typography>
            <Typography variant="h4" fontWeight={700} color="#F3797E">
              {summary.complaint}
            </Typography>
            <Typography variant="caption">HR related</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 2, mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => {
            setTab(v);
            setPage(0);
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label={`Pending (${summary.pending})`} />
          <Tab label={`Resolved (${summary.resolved})`} />
          <Tab label={`All (${summary.total})`} />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              placeholder="Search title or description..."
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="RESOLVED">Resolved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filterType}
                label="Type"
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="TECHNICAL_ISSUE">Technical Issue</MenuItem>
                <MenuItem value="COMPLAINT">Complaint</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={5} textAlign="right">
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              sx={{ mr: 1 }}
              onClick={() => {
                setSearch("");
                setFilterStatus("All");
                setFilterType("All");
                setTab(0);
                setPage(0);
              }}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => exportCSV(filtered)}
              sx={{ backgroundColor: COLORS.support }}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{c.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={
                          c.type === "TECHNICAL_ISSUE"
                            ? "Technical"
                            : "Complaint"
                        }
                        size="small"
                        color={
                          c.type === "TECHNICAL_ISSUE" ? "info" : "warning"
                        }
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" noWrap>
                        {c.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.status === "PENDING" ? "Pending" : "Resolved"}
                        size="small"
                        color={c.status === "PENDING" ? "warning" : "success"}
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => openView(c)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No issues found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* New Issue dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>Submit New Issue</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Issue Type</FormLabel>
                <RadioGroup
                  row
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <FormControlLabel
                    value="TECHNICAL_ISSUE"
                    control={<Radio />}
                    label="Technical Issue (Admin will handle)"
                  />
                  <FormControlLabel
                    value="COMPLAINT"
                    control={<Radio />}
                    label="Complaint (HR will handle)"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                size="small"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Brief summary of the issue"
                inputProps={{ maxLength: 100 }}
                helperText={`${form.title.length}/100 characters`}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={6}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Provide detailed information about the issue..."
                inputProps={{ maxLength: 2000 }}
                helperText={`${form.description.length}/2000 characters`}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Technical Issues</strong> will be handled by the Admin team.
            <br />
            <strong>Complaints</strong> will be handled by the HR department.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={saveNew}
            disabled={!form.title.trim() || !form.description.trim()}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!selected} onClose={closeView} fullWidth maxWidth="sm">
        <DialogTitle>Issue Details</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Box sx={{ py: 1 }}>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  label={
                    selected.type === "TECHNICAL_ISSUE"
                      ? "Technical Issue"
                      : "Complaint"
                  }
                  color={
                    selected.type === "TECHNICAL_ISSUE" ? "info" : "warning"
                  }
                  size="small"
                />
                <Chip
                  label={selected.status === "PENDING" ? "Pending" : "Resolved"}
                  color={selected.status === "PENDING" ? "warning" : "success"}
                  size="small"
                />
              </Stack>

              <Typography variant="h6" fontWeight={700} gutterBottom>
                {selected.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selected.description}
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1, mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Submitted
                    </Typography>
                    <Typography>
                      {selected.createdAt
                        ? new Date(selected.createdAt).toLocaleString()
                        : "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography>
                      {selected.updatedAt
                        ? new Date(selected.updatedAt).toLocaleString()
                        : "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={
                        selected.status === "PENDING" ? "Pending" : "Resolved"
                      }
                      size="small"
                      color={
                        selected.status === "PENDING" ? "warning" : "success"
                      }
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {selected.status === "RESOLVED" && (
                <>
                  <Typography variant="subtitle2" gutterBottom>
                    Resolution
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 1, bgcolor: "success.light" }}
                  >
                    <Typography variant="body2">
                      {selected.remark || "No resolution details provided."}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Resolved by: {selected.updatedBy || "N/A"}
                    </Typography>
                  </Paper>
                </>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
