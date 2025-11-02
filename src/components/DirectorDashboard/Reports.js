// // src/components/EmployeeDashboard/Reports.js
// import React from "react";
// import { Paper, Typography, List, ListItem, ListItemText, IconButton, Link } from "@mui/material";
// import DownloadIcon from "@mui/icons-material/Download";

// const Reports = () => {
//   const reports = [
//     { id: 1, name: "Annual Performance 2024", fileUrl: "/reports/annual-performance-2024.pdf" },
//     { id: 2, name: "Salary Slip March 2025", fileUrl: "/reports/salary-slip-mar-2025.pdf" },
//     { id: 3, name: "Leave Summary 2024", fileUrl: "/reports/leave-summary-2024.pdf" },
//   ];

//   return (
//     <Paper sx={{ p: 3, maxWidth: 700 }}>
//       <Typography variant="h6" gutterBottom>
//         Public Reports
//       </Typography>
//       <List>
//         {reports.map(({ id, name, fileUrl }) => (
//           <ListItem
//             key={id}
//             secondaryAction={
//               <IconButton
//                 edge="end"
//                 component={Link}
//                 href={fileUrl}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 aria-label="download"
//               >
//                 <DownloadIcon />
//               </IconButton>
//             }
//           >
//             <ListItemText primary={name} />
//           </ListItem>
//         ))}
//       </List>
//     </Paper>
//   );
// };

// export default Reports;
// src/components/EmployeeDashboard/Reports.js
import React, { useState, useMemo } from "react";
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
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Reports() {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Annual Performance 2024",
      fileUrl: "/reports/annual-performance-2024.pdf",
    },
    {
      id: 2,
      name: "Salary Slip March 2025",
      fileUrl: "/reports/salary-slip-mar-2025.pdf",
    },
    {
      id: 3,
      name: "Leave Summary 2024",
      fileUrl: "/reports/leave-summary-2024.pdf",
    },
  ]);
  const [search, setSearch] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [loading, setLoading] = useState(false);

  // Reload function (simulated)
  const reloadReports = async () => {
    setLoading(true);
    try {
      // Example: Replace with backend call later
      // const { data } = await axiosInstance.get("http://localhost:8080/employee/reports");
      // setReports(data);
      await new Promise((r) => setTimeout(r, 1000)); // simulate delay
      setSnack({
        open: true,
        msg: "Reports reloaded successfully",
        sev: "success",
      });
    } catch {
      setSnack({ open: true, msg: "Failed to reload reports", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredReports = useMemo(() => {
    if (!search.trim()) return reports;
    const query = search.toLowerCase();
    return reports.filter(
      (r) =>
        r.name.toLowerCase().includes(query) || r.id.toString().includes(query)
    );
  }, [reports, search]);

  return (
    <Box
      sx={{
        backgroundColor: "#f6f7fb",
        minHeight: "100vh",
        p: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ===== Toolbar ===== */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: "#4B49AC", flexGrow: 1 }}
        >
          Public Reports
        </Typography>

        <TextField
          size="small"
          label="Search by Title / ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={
              <RefreshIcon
                sx={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              />
            }
            variant="outlined"
            onClick={reloadReports}
            disabled={loading}
            sx={{
              borderColor: "#4B49AC",
              color: "#4B49AC",
              textTransform: "none",
            }}
          >
            {loading ? "Reloading..." : "Reload"}
          </Button>
        </Box>
      </Paper>

      {/* ===== Reports Grid ===== */}
      <Grid container spacing={2}>
        {filteredReports.length === 0 ? (
          <Grid item xs={12}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                textAlign: "center",
                borderRadius: 3,
                color: "text.secondary",
              }}
            >
              No reports found
            </Paper>
          </Grid>
        ) : (
          filteredReports.map((r) => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <Paper
                elevation={3}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 160,
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
                      color: "#4B49AC",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {r.name}
                  </Typography>
                  <Divider sx={{ my: 1 }} />
                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Tooltip title="Download Report">
                    <IconButton
                      color="primary"
                      href={r.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        backgroundColor: "#7DA0FA",
                        color: "#fff",
                        "&:hover": { backgroundColor: "#4B49AC" },
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

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
