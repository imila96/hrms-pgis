// src/components/EmployeeDashboard/Reports.js
import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  IconButton,
  Button,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
  TextField,
  CircularProgress,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import FilterListIcon from "@mui/icons-material/FilterList";
import axiosInstance from "../../AxiosInstance";

const COLORS = {
  primary: "#4B49AC",
  support: "#7DA0FA",
  alt: "#7978E9",
  bg: "#F5F7FF",
};

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/reports");
      if (Array.isArray(res.data) && res.data.length) setReports(res.data);
      else {
        // fallback mock data
        setReports([
          {
            id: 1,
            name: "Annual Performance 2024",
            fileUrl: "/reports/annual-performance-2024.pdf",
            date: "2024-12-31",
          },
          {
            id: 2,
            name: "Salary Slip March 2025",
            fileUrl: "/reports/salary-slip-mar-2025.pdf",
            date: "2025-03-31",
          },
          {
            id: 3,
            name: "Leave Summary 2024",
            fileUrl: "/reports/leave-summary-2024.pdf",
            date: "2024-10-01",
          },
        ]);
      }
      setSnack({ open: true, msg: "Reports loaded successfully", sev: "success" });
    } catch (e) {
      console.error("Failed to load reports:", e);
      setSnack({ open: true, msg: "Failed to load reports", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return reports;
    const q = search.toLowerCase();
    return reports.filter((r) => r.name.toLowerCase().includes(q));
  }, [reports, search]);

  return (
    <Box sx={{ p: 3, backgroundColor: COLORS.bg, minHeight: "100vh" }}>
      {/* ===== Header ===== */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} color={COLORS.primary}>
            Employee Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Access and download your available reports and salary slips.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            size="small"
            label="Search reports"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setSearch("")}
          >
            Reset
          </Button>
          <Button
            startIcon={
              loading ? (
                <CircularProgress size={16} sx={{ color: "#fff" }} />
              ) : (
                <RefreshIcon />
              )
            }
            variant="contained"
            sx={{ backgroundColor: COLORS.primary }}
            onClick={fetchReports}
            disabled={loading}
          >
            {loading ? "Loading..." : "Reload"}
          </Button>
        </Box>
      </Paper>

      {/* ===== Reports Grid ===== */}
      {filtered.length === 0 ? (
        <Paper
          elevation={2}
          sx={{
            p: 4,
            textAlign: "center",
            color: "text.secondary",
            borderRadius: 2,
          }}
        >
          <Typography>No reports found</Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((r) => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  height: 160,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(75,73,172,0.15)",
                  },
                }}
              >
                <Box>
                  <Typography
                    fontWeight={700}
                    sx={{
                      color: COLORS.primary,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: 13 }}
                  >
                    {r.date
                      ? new Date(r.date).toLocaleDateString()
                      : "— No Date —"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Tooltip title="Download Report">
                    <IconButton
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        backgroundColor: COLORS.support,
                        color: "#fff",
                        "&:hover": { backgroundColor: COLORS.primary },
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ===== Snackbar ===== */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snack.sev}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
