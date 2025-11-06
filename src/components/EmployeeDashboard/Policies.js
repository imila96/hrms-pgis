// src/components/EmployeeDashboard/Policies.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
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
  Stack,
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const res = await axiosInstance.get("/policies");
        if (Array.isArray(res.data) && res.data.length) {
          setPolicies(res.data);
        }
      } catch (e) {
        console.error("Failed to fetch policies:", e);
      }
    };
    fetchPolicies();
  }, []);

  const filtered = useMemo(() => {
    let list = policies.slice();
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
  }, [policies, search]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openView = (p) => {
    setSelectedPolicy(p);
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

        <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
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
    </Box>
  );
}
