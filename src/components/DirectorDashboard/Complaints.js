// src/components/DirectorDashboard/Complaints.js
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
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import axiosInstance from "../../AxiosInstance";

const COLORS = {
  primary: "#4B49AC",
  support: "#7DA0FA",
  alt: "#7978E9",
  bg: "#F5F7FF",
};

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [tab, setTab] = useState(0); // 0 Open,1 In Progress,2 Resolved,3 All
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState(null); // view dialog

  const summary = useMemo(
    () => ({
      total: complaints.length,
      open: complaints.filter((c) => c.status === "Open").length,
      inProgress: complaints.filter((c) => c.status === "In Progress").length,
      resolved: complaints.filter((c) => c.status === "Resolved").length,
    }),
    [complaints]
  );

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axiosInstance.get("/complaints");
        if (Array.isArray(res.data) && res.data.length) setComplaints(res.data);
      } catch (e) {
        console.error("Failed to fetch complaints", e);
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let list = complaints.slice();
    if (tab === 0) list = list.filter((c) => c.status === "Open");
    if (tab === 1) list = list.filter((c) => c.status === "In Progress");
    if (tab === 2) list = list.filter((c) => c.status === "Resolved");
    if (filterStatus !== "All")
      list = list.filter((c) => c.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.description || "").toLowerCase().includes(q) ||
          (c.submittedBy || "").toLowerCase().includes(q)
      );
    }
    list.sort(
      (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
    );
    return list;
  }, [complaints, tab, filterStatus, search]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openView = (c) => setSelected(c);
  const closeView = () => setSelected(null);

  const exportCSV = (rows) => {
    const header = [
      "ID",
      "Title",
      "Description",
      "SubmittedBy",
      "SubmittedAt",
      "Status",
      "AssignedTo",
    ];
    const csv = [header.join(",")]
      .concat(
        rows.map((r) =>
          [
            r.id,
            `"${(r.title || "").replace(/"/g, '""')}"`,
            `"${(r.description || "").replace(/"/g, '""')}"`,
            r.submittedBy || "",
            r.submittedAt || "",
            r.status || "",
            r.assignedTo || "",
          ].join(",")
        )
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "complaints_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3, background: COLORS.bg, minHeight: "70vh" }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
            Complaints Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View complaints submitted by employees and their resolution status.
          </Typography>
        </Box>
      </Stack>

      {/* ===== Summary Cards ===== */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total Complaints
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
              Open
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.alt}>
              {summary.open}
            </Typography>
            <Typography variant="caption">Awaiting action</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
            <Typography variant="h4" fontWeight={700} color={COLORS.support}>
              {summary.inProgress}
            </Typography>
            <Typography variant="caption">Being worked on</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
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
      </Grid>

      {/* ===== Tabs ===== */}
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
          <Tab label={`Open (${summary.open})`} />
          <Tab label={`In Progress (${summary.inProgress})`} />
          <Tab label={`Resolved (${summary.resolved})`} />
          <Tab label={`All (${summary.total})`} />
        </Tabs>
      </Paper>

      {/* ===== Filters and Table ===== */}
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search title, description or reporter..."
              size="small"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
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
                <MenuItem value="Open">Open</MenuItem>
                <MenuItem value="In Progress">In Progress</MenuItem>
                <MenuItem value="Resolved">Resolved</MenuItem>
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
                <TableCell>Description</TableCell>
                <TableCell>Reporter</TableCell>
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
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" noWrap>
                        {c.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{c.submittedBy}</TableCell>
                    <TableCell>
                      {c.submittedAt
                        ? new Date(c.submittedAt).toLocaleString()
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={c.status}
                        size="small"
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
                    No complaints found.
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

      {/* ===== View dialog only ===== */}
      <Dialog open={!!selected} onClose={closeView} fullWidth maxWidth="sm">
        <DialogTitle>Complaint Details</DialogTitle>
        <DialogContent dividers>
          {selected ? (
            <Box sx={{ py: 1 }}>
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
                      Reporter
                    </Typography>
                    <Typography>{selected.submittedBy || "-"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Submitted
                    </Typography>
                    <Typography>
                      {selected.submittedAt
                        ? new Date(selected.submittedAt).toLocaleString()
                        : "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selected.status}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assigned To
                    </Typography>
                    <Typography>{selected.assignedTo || "-"}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Typography variant="subtitle2">Remarks</Typography>
              {Array.isArray(selected.remarks) && selected.remarks.length ? (
                <List>
                  {selected.remarks.map((r, idx) => (
                    <ListItem key={idx} alignItems="flex-start">
                      <ListItemText
                        primary={r.text}
                        secondary={`${r.by} • ${
                          r.at ? new Date(r.at).toLocaleString() : ""
                        }`}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No remarks yet.
                </Typography>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeView}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
