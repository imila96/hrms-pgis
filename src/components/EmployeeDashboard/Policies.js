// src/components/EmployeeDashboard/Policies.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
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
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import FilterListIcon from "@mui/icons-material/FilterList";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";

const COLORS = {
  primary: "#4B49AC",
  softBlue: "#98BDFF",
  support: "#7DA0FA",
  alt: "#7978E9",
  accent: "#F3797E",
  bg: "#F5F7FF",
};

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [tab, setTab] = useState(0); // 0 Active, 1 Upcoming, 2 Archived, 3 All
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const computeDisplayStatus = (rawStatus, effectiveDate) => {
    try {
      const today = new Date();
      if (rawStatus === "APPROVED") {
        if (effectiveDate) {
          const d = new Date(effectiveDate);
          return d > today ? "Upcoming" : "Active";
        }
        return "Active";
      }
      if (rawStatus === "REJECTED") return "Archived";
      return "Pending"; // PENDING or unknown
    } catch (e) {
      return "Pending";
    }
  };

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axiosInstance.get("/policies");
        if (Array.isArray(res.data)) {
          const mapped = res.data.map((d) => ({
            id: d.id,
            title: d.title,
            description: d.description || "",
            effectiveDate: d.effectiveDate || null,
            rawStatus: d.status,
            status: computeDisplayStatus(d.status, d.effectiveDate),
            createdBy: d.createdBy || null,
            decidedBy: d.decidedBy || null,
            decidedAt: d.decidedAt || null,
          }));
          setPolicies(mapped);
        }
      } catch (e) {
        console.error("Failed to fetch policies:", e);
      }
    };
    fetchPolicies();
  }, []);

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

  const filtered = useMemo(() => {
    let list = policies.slice();
    if (tab === 0) list = list.filter((p) => p.status === "Active");
    if (tab === 1) list = list.filter((p) => p.status === "Upcoming");
    if (tab === 2) list = list.filter((p) => p.status === "Archived");
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
  }, [policies, tab, search]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openView = async (p) => {
    try {
      const res = await axiosInstance.get(`/policies/${p.id}`);
      setSelectedPolicy(res.data);
    } catch (e) {
      console.error("Failed to fetch policy detail", e);
      setSelectedPolicy(p);
    }
  };
  
  const closeView = () => {
    setSelectedPolicy(null);
  };

  const exportCSV = (rows) => {
    const header = [
      "ID",
      "Title",
      "Description",
      "EffectiveDate",
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
    <Box>
      <BackButton />
      <Box sx={{ p: 3, background: COLORS.bg, minHeight: "70vh" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
              Company Policies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and review organizational policies.
            </Typography>
          </Box>
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

            <Grid item xs={12} md={8} textAlign="right">
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                sx={{ mr: 1 }}
                onClick={() => {
                  setSearch("");
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
                      <TableCell>{p.createdBy || "-"}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => openView(p)}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
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
    </Box>
  );
}
