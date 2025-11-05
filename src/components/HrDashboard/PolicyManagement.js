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
  Divider,
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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import axiosInstance from "../../AxiosInstance";

const COLORS = {
  primary: "#4B49AC",
  softBlue: "#98BDFF",
  support: "#7DA0FA",
  alt: "#7978E9",
  accent: "#F3797E",
  bg: "#F5F7FF",
};

const MOCK_POLICIES = [
  {
    id: "p1",
    title: "Remote Work Policy",
    description: "Guidelines for remote work and home office setup.",
    effectiveDate: "2025-11-01",
    status: "Active",
    createdBy: "Admin",
    decidedBy: "Director",
    decidedAt: "2025-10-15T10:00:00",
  },
  {
    id: "p2",
    title: "Leave Policy Update",
    description: "Revised leave accruals and carryover rules.",
    effectiveDate: "2025-12-01",
    status: "Upcoming",
    createdBy: "HR",
    decidedBy: null,
    decidedAt: null,
  },
  {
    id: "p3",
    title: "Data Protection Policy",
    description: "Standards for handling personal and sensitive data.",
    effectiveDate: "2025-09-01",
    status: "Archived",
    createdBy: "Legal",
    decidedBy: "CEO",
    decidedAt: "2025-08-20T09:30:00",
  },
  {
    id: "p4",
    title: "Overtime Compensation",
    description: "Rules and approval for overtime payments.",
    effectiveDate: "2025-11-15",
    status: "Active",
    createdBy: "Finance",
    decidedBy: "CFO",
    decidedAt: "2025-10-20T11:00:00",
  },
  {
    id: "p5",
    title: "Hybrid Work Hours",
    description: "Flexible hours for hybrid employees.",
    effectiveDate: "2026-01-01",
    status: "Upcoming",
    createdBy: "HR",
    decidedBy: null,
    decidedAt: null,
  },
];

export default function PolicyManagement() {
  const [policies, setPolicies] = useState(MOCK_POLICIES);

  const [tab, setTab] = useState(0); // 0 Active,1 Upcoming,2 Archived,3 All
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    effectiveDate: "",
    status: "Active",
  });
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  // summary
  const summary = useMemo(
    () => ({
      total: policies.length,
      active: policies.filter((p) => p.status === "Active").length,
      upcoming: policies.filter((p) => p.status === "Upcoming").length,
      archived: policies.filter((p) => p.status === "Archived").length,
    }),
    [policies]
  );

  useEffect(() => {
    // keep mock for now; attempt to fetch real data and replace if available
    const fetch = async () => {
      try {
        const res = await axiosInstance.get("/policies");
        if (Array.isArray(res.data) && res.data.length) setPolicies(res.data);
      } catch (e) {
        // ignore, keep mock
      }
    };
    fetch();
  }, []);

  const filtered = useMemo(() => {
    let list = policies.slice();
    if (tab === 0) list = list.filter((p) => p.status === "Active");
    if (tab === 1) list = list.filter((p) => p.status === "Upcoming");
    if (tab === 2) list = list.filter((p) => p.status === "Archived");
    if (filterStatus !== "All")
      list = list.filter((p) => p.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }
    list.sort(
      (a, b) => new Date(b.effectiveDate || 0) - new Date(a.effectiveDate || 0)
    );
    return list;
  }, [policies, tab, filterStatus, search]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      effectiveDate: "",
      status: "Active",
    });
    setDialogOpen(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || "",
      description: p.description || "",
      effectiveDate: p.effectiveDate || "",
      status: p.status || "Active",
    });
    setDialogOpen(true);
  };
  const closeDialog = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const openView = (p) => {
    setSelectedPolicy(p);
  };
  const closeView = () => {
    setSelectedPolicy(null);
  };

  const savePolicy = async () => {
    if (!form.title) return alert("Please enter a title");
    try {
      if (editing) {
        // try api update
        try {
          await axiosInstance.put(`/policies/${editing.id}`, form);
        } catch (e) {
          /* ignore */
        }
        setPolicies((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...form } : p))
        );
      } else {
        const newP = { id: `local-${Date.now()}`, ...form, createdBy: "Local" };
        try {
          await axiosInstance.post("/policies", newP);
        } catch (e) {
          /* ignore */
        }
        setPolicies((prev) => [newP, ...prev]);
      }
      closeDialog();
    } catch (e) {
      console.error(e);
      alert("Failed to save policy");
    }
  };

  const exportCSV = (rows) => {
    const header = [
      "ID",
      "Title",
      "Description",
      "EffectiveDate",
      "Status",
      "CreatedBy",
    ];
    const csv = [header.join(",")]
      .concat(
        rows.map((r) =>
          [
            r.id,
            `"${(r.title || "").replace(/"/g, '""')}"`,
            `"${(r.description || "").replace(/"/g, '""')}"`,
            r.effectiveDate || "",
            r.status || "",
            r.createdBy || "",
          ].join(",")
        )
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "policies_export.csv";
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
            Policy Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create, review and manage organizational policies.
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={openAdd}
          sx={{ backgroundColor: COLORS.primary, color: "#fff" }}
        >
          Add Policy
        </Button>
      </Stack>

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
                Total Policies
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
                Active
              </Typography>
              <Typography variant="h4" fontWeight={700} color={COLORS.alt}>
                {summary.active}
              </Typography>
              <Typography variant="caption">Currently in effect</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Upcoming
              </Typography>
              <Typography variant="h4" fontWeight={700} color={COLORS.support}>
                {summary.upcoming}
              </Typography>
              <Typography variant="caption">Planned</Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Archived
              </Typography>
              <Typography variant="h4" fontWeight={700} color={COLORS.accent}>
                {summary.archived}
              </Typography>
              <Typography variant="caption">Deprecated</Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

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
          <Tab label={`Active (${summary.active})`} />
          <Tab label={`Upcoming (${summary.upcoming})`} />
          <Tab label={`Archived (${summary.archived})`} />
          <Tab label={`All (${summary.total})`} />
        </Tabs>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
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
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Upcoming">Upcoming</MenuItem>
                <MenuItem value="Archived">Archived</MenuItem>
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
                <TableCell>Effective</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Typography fontWeight={700}>{p.title}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" noWrap>
                        {p.description}
                      </Typography>
                    </TableCell>
                    <TableCell>{p.effectiveDate || "-"}</TableCell>
                    <TableCell>
                      <Chip
                        label={p.status}
                        size="small"
                        sx={{ borderRadius: 1 }}
                      />
                    </TableCell>
                    <TableCell>{p.createdBy || "-"}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openView(p)}
                        >
                          View
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No policies found.
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

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="md">
        <DialogTitle>{editing ? "Edit Policy" : "Add New Policy"}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label="Title"
                fullWidth
                size="small"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                helperText={!form.title ? "Title is required" : ""}
                error={!form.title}
              />

              <Box sx={{ mt: 2 }}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  minRows={6}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Status
                </Typography>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={form.status}
                    label="Status"
                    onChange={(e) =>
                      setForm({ ...form, status: e.target.value })
                    }
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Upcoming">Upcoming</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </FormControl>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="text.secondary">
                  Effective Date
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={form.effectiveDate}
                  onChange={(e) =>
                    setForm({ ...form, effectiveDate: e.target.value })
                  }
                  sx={{ mt: 1 }}
                />

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" color="text.secondary">
                  Created By
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.createdBy || ""}
                  onChange={(e) =>
                    setForm({ ...form, createdBy: e.target.value })
                  }
                  sx={{ mt: 1 }}
                />

                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  Decided By
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={form.decidedBy || ""}
                  onChange={(e) =>
                    setForm({ ...form, decidedBy: e.target.value })
                  }
                  sx={{ mt: 1 }}
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={savePolicy}
            disabled={!form.title || !form.title.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Details dialog (read-only) */}
      <Dialog
        open={!!selectedPolicy}
        onClose={closeView}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Policy Details</DialogTitle>
        <DialogContent dividers>
          {selectedPolicy ? (
            <Box sx={{ py: 1 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                {selectedPolicy.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedPolicy.description}
              </Typography>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Effective Date
                    </Typography>
                    <Typography>
                      {selectedPolicy.effectiveDate || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedPolicy.status}
                      size="small"
                      sx={{ borderRadius: 1 }}
                    />
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created By
                    </Typography>
                    <Typography>{selectedPolicy.createdBy || "-"}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Decided By
                    </Typography>
                    <Typography>{selectedPolicy.decidedBy || "-"}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Decided At
                    </Typography>
                    <Typography>
                      {selectedPolicy.decidedAt
                        ? new Date(selectedPolicy.decidedAt).toLocaleString()
                        : "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
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
