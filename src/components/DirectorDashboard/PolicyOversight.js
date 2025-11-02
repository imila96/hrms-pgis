// // src/components/DirectorDashboard/PolicyOversight.js
// import React, { useEffect, useState, useMemo } from "react";
// import {
//   Box,
//   Typography,
//   Paper,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
//   Button,
//   Chip,
//   Stack,
//   Snackbar,
//   Alert,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import axiosInstance from "../../AxiosInstance";

// export default function PolicyOversight() {
//   const [allPolicies, setAllPolicies] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("PENDING");
//   const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

//   // details dialog
//   const [selectedPolicy, setSelectedPolicy] = useState(null);

//   const load = async () => {
//     try {
//       const { data } = await axiosInstance.get(
//         "http://localhost:8080/policies"
//       );
//       setAllPolicies(data);
//     } catch {
//       setSnack({ open: true, msg: "Failed to load policies", sev: "error" });
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const decide = async (id, approve) => {
//     try {
//       await axiosInstance.patch(
//         `http://localhost:8080/policies/${id}?approve=${approve}`
//       );
//       // optimistic update
//       setAllPolicies((prev) =>
//         prev.map((p) =>
//           p.id === id ? { ...p, status: approve ? "APPROVED" : "REJECTED" } : p
//         )
//       );
//       setSnack({
//         open: true,
//         msg: approve ? "Approved." : "Rejected.",
//         sev: "success",
//       });
//     } catch {
//       setSnack({ open: true, msg: "Failed to submit decision", sev: "error" });
//     }
//   };

//   const chipColor = (s) =>
//     s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

//   const filteredTop = useMemo(() => {
//     return statusFilter
//       ? allPolicies.filter((p) => p.status === statusFilter)
//       : allPolicies;
//   }, [allPolicies, statusFilter]);

//   const decided = useMemo(
//     () => allPolicies.filter((p) => p.status !== "PENDING"),
//     [allPolicies]
//   );

//   const openDetails = async (id) => {
//     try {
//       const { data } = await axiosInstance.get(
//         `http://localhost:8080/policies/${id}`
//       );
//       setSelectedPolicy(data);
//     } catch {
//       setSnack({
//         open: true,
//         msg: "Failed to load policy details",
//         sev: "error",
//       });
//     }
//   };
//   const closeDetails = () => setSelectedPolicy(null);

//   // Common cell style for clickable titles (no link look)
//   const titleCellSx = {
//     cursor: "pointer",
//     "&:hover": { backgroundColor: "action.hover" },
//   };

//   return (
//     <Box>
//       {/* Header + filter */}
//       <Stack
//         direction="row"
//         justifyContent="space-between"
//         alignItems="center"
//         mb={2}
//       >
//         <Typography variant="h5">Policy Oversight</Typography>
//         <FormControl size="small" sx={{ minWidth: 180 }}>
//           <InputLabel id="policy-status-label" shrink>
//             Status
//           </InputLabel>
//           <Select
//             labelId="policy-status-label"
//             id="policy-status"
//             value={statusFilter}
//             label="Status"
//             onChange={(e) => setStatusFilter(e.target.value)}
//             displayEmpty
//             renderValue={(val) => (val === "" ? "All" : val)}
//           >
//             <MenuItem value="">All</MenuItem>
//             <MenuItem value="PENDING">Pending</MenuItem>
//             <MenuItem value="APPROVED">Approved</MenuItem>
//             <MenuItem value="REJECTED">Rejected</MenuItem>
//           </Select>
//         </FormControl>
//       </Stack>

//       {/* Top table (filtered) */}
//       <Paper sx={{ mb: 3 }}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>
//                 <strong>ID</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Title</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Effective Date</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Status</strong>
//               </TableCell>
//               <TableCell align="right">
//                 <strong>Actions</strong>
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {filteredTop.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={5} align="center">
//                   No policies
//                 </TableCell>
//               </TableRow>
//             ) : (
//               filteredTop.map((p) => (
//                 <TableRow key={p.id}>
//                   <TableCell>{p.id}</TableCell>
//                   <TableCell sx={titleCellSx} onClick={() => openDetails(p.id)}>
//                     {p.title}
//                   </TableCell>
//                   <TableCell>{p.effectiveDate}</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={p.status}
//                       color={chipColor(p.status)}
//                       size="small"
//                     />
//                   </TableCell>
//                   <TableCell align="right">
//                     {p.status === "PENDING" ? (
//                       <Stack
//                         direction="row"
//                         spacing={1}
//                         justifyContent="flex-end"
//                       >
//                         <Button
//                           size="small"
//                           variant="outlined"
//                           color="error"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             decide(p.id, false);
//                           }}
//                         >
//                           Reject
//                         </Button>
//                         <Button
//                           size="small"
//                           variant="contained"
//                           color="success"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             decide(p.id, true);
//                           }}
//                         >
//                           Approve
//                         </Button>
//                       </Stack>
//                     ) : (
//                       "—"
//                     )}
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </Paper>

//       {/* Bottom table: decided items stay visible here */}
//       <Typography variant="h6" sx={{ mb: 1 }}>
//         Decided Policies
//       </Typography>
//       <Paper>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>
//                 <strong>ID</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Title</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Effective Date</strong>
//               </TableCell>
//               <TableCell>
//                 <strong>Status</strong>
//               </TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {decided.length === 0 ? (
//               <TableRow>
//                 <TableCell colSpan={4} align="center">
//                   None yet
//                 </TableCell>
//               </TableRow>
//             ) : (
//               decided.map((p) => (
//                 <TableRow key={p.id}>
//                   <TableCell>{p.id}</TableCell>
//                   <TableCell sx={titleCellSx} onClick={() => openDetails(p.id)}>
//                     {p.title}
//                   </TableCell>
//                   <TableCell>{p.effectiveDate}</TableCell>
//                   <TableCell>
//                     <Chip
//                       label={p.status}
//                       color={chipColor(p.status)}
//                       size="small"
//                     />
//                   </TableCell>
//                 </TableRow>
//               ))
//             )}
//           </TableBody>
//         </Table>
//       </Paper>

//       {/* Details dialog */}
//       {selectedPolicy && (
//         <Dialog open onClose={closeDetails} fullWidth maxWidth="sm">
//           <DialogTitle>Policy Details</DialogTitle>
//           <DialogContent dividers>
//             <Typography variant="subtitle1">
//               <strong>Title:</strong> {selectedPolicy.title}
//             </Typography>
//             <Typography variant="subtitle1" sx={{ mt: 1 }}>
//               <strong>Description:</strong>
//             </Typography>
//             <Typography paragraph>{selectedPolicy.description}</Typography>
//             <Typography>
//               <strong>Status:</strong> {selectedPolicy.status}
//             </Typography>
//             <Typography>
//               <strong>Effective Date:</strong>{" "}
//               {selectedPolicy.effectiveDate || "N/A"}
//             </Typography>
//             <Typography>
//               <strong>Created By:</strong> {selectedPolicy.createdBy}
//             </Typography>
//             {selectedPolicy.decidedBy && (
//               <>
//                 <Typography>
//                   <strong>Decided By:</strong> {selectedPolicy.decidedBy}
//                 </Typography>
//                 <Typography>
//                   <strong>Decided At:</strong>{" "}
//                   {selectedPolicy.decidedAt?.replace("T", " ").slice(0, 16)}
//                 </Typography>
//               </>
//             )}
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={closeDetails}>Close</Button>
//           </DialogActions>
//         </Dialog>
//       )}

//       <Snackbar
//         open={snack.open}
//         autoHideDuration={2500}
//         onClose={() => setSnack((s) => ({ ...s, open: false }))}
//       >
//         <Alert
//           severity={snack.sev}
//           onClose={() => setSnack((s) => ({ ...s, open: false }))}
//         >
//           {snack.msg}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// }

import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Chip,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  TextField,
} from "@mui/material";
import { Refresh, Download } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PolicyOversight() {
  const [allPolicies, setAllPolicies] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [loading, setLoading] = useState(false);

  // === Fetch policies ===
  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(
        "http://localhost:8080/policies"
      );
      setAllPolicies(data);
      setSnack({
        open: true,
        msg: "Policies loaded successfully",
        sev: "success",
      });
    } catch {
      setSnack({ open: true, msg: "Failed to load policies", sev: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // === Approve / Reject ===
  const decide = async (id, approve) => {
    try {
      await axiosInstance.patch(
        `http://localhost:8080/policies/${id}?approve=${approve}`
      );
      setAllPolicies((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status: approve ? "APPROVED" : "REJECTED" } : p
        )
      );
      setSnack({
        open: true,
        msg: approve ? "Approved." : "Rejected.",
        sev: "success",
      });
    } catch {
      setSnack({ open: true, msg: "Failed to submit decision", sev: "error" });
    }
  };

  // === Colors for chips ===
  const chipColor = (s) =>
    s === "APPROVED" ? "success" : s === "REJECTED" ? "error" : "warning";

  // === Filter + Search ===
  const filteredPolicies = useMemo(() => {
    let data = [...allPolicies];
    if (statusFilter) data = data.filter((p) => p.status === statusFilter);
    if (search.trim()) {
      const term = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.title?.toLowerCase().includes(term) ||
          p.id?.toString().toLowerCase().includes(term)
      );
    }
    return data;
  }, [allPolicies, statusFilter, search]);

  const decidedPolicies = useMemo(
    () => allPolicies.filter((p) => p.status !== "PENDING"),
    [allPolicies]
  );

  // === Open/close details dialog ===
  const openDetails = async (id) => {
    try {
      const { data } = await axiosInstance.get(
        `http://localhost:8080/policies/${id}`
      );
      setSelectedPolicy(data);
    } catch {
      setSnack({
        open: true,
        msg: "Failed to load policy details",
        sev: "error",
      });
    }
  };
  const closeDetails = () => setSelectedPolicy(null);

  // === Export PDF ===
  const exportPDF = () => {
    const doc = new jsPDF();
    autoTable(doc, {
      head: [["ID", "Title", "Effective Date", "Status"]],
      body: filteredPolicies.map((p) => [
        p.id,
        p.title,
        p.effectiveDate,
        p.status,
      ]),
    });
    doc.save("policies.pdf");
  };

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
          gap: 2,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: "#4B49AC", flexGrow: 1 }}
        >
          Policy Oversight
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="status-label">Filter Status</InputLabel>
            <Select
              labelId="status-label"
              value={statusFilter}
              label="Filter Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Search by Title / ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ minWidth: 220 }}
          />
        </Stack>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            startIcon={
              <Refresh
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
            onClick={load}
            sx={{
              color: "#4B49AC",
              borderColor: "#4B49AC",
              textTransform: "none",
            }}
            disabled={loading}
          >
            {loading ? "Reloading..." : "Reload"}
          </Button>

          <Button
            startIcon={<Download />}
            variant="contained"
            onClick={exportPDF}
            disabled={loading}
            sx={{
              backgroundColor: "#4B49AC",
              "&:hover": { backgroundColor: "#7DA0FA" },
              textTransform: "none",
            }}
          >
            Export PDF
          </Button>
        </Box>
      </Paper>

      {/* ===== Policies Grid ===== */}
      <Grid container spacing={2}>
        {filteredPolicies.length === 0 ? (
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
              No policies found
            </Paper>
          </Grid>
        ) : (
          filteredPolicies.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Paper
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 230,
                  cursor: "pointer",
                  transition: "0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 24px rgba(75,73,172,0.15)",
                  },
                }}
                onClick={() => openDetails(p.id)}
              >
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                      color: "#4B49AC",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {p.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Effective: {p.effectiveDate || "N/A"}
                  </Typography>
                  <Chip
                    label={p.status}
                    color={chipColor(p.status)}
                    size="small"
                  />
                </Box>

                {p.status === "PENDING" ? (
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        decide(p.id, false);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      fullWidth
                      onClick={(e) => {
                        e.stopPropagation();
                        decide(p.id, true);
                      }}
                    >
                      Approve
                    </Button>
                  </Stack>
                ) : (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{ mt: 3 }}
                  >
                    {p.status === "APPROVED"
                      ? "Approved ✅"
                      : p.status === "REJECTED"
                      ? "Rejected ❌"
                      : ""}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* ===== Decided Section ===== */}
      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ color: "#4B49AC", mt: 4, mb: 2 }}
      >
        Decided Policies
      </Typography>

      <Grid container spacing={2}>
        {decidedPolicies.length === 0 ? (
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
              None yet
            </Paper>
          </Grid>
        ) : (
          decidedPolicies.map((p) => (
            <Grid item xs={12} sm={6} md={4} key={p.id}>
              <Paper
                elevation={1}
                sx={{
                  borderRadius: 3,
                  p: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  height: 180,
                  cursor: "pointer",
                }}
                onClick={() => openDetails(p.id)}
              >
                <Box>
                  <Typography fontWeight={700} sx={{ color: "#4B49AC" }}>
                    {p.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {p.effectiveDate}
                  </Typography>
                </Box>
                <Chip
                  label={p.status}
                  color={chipColor(p.status)}
                  size="small"
                  sx={{ alignSelf: "flex-start" }}
                />
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      {/* ===== Details Dialog ===== */}
      {selectedPolicy && (
        <Dialog open onClose={closeDetails} fullWidth maxWidth="sm">
          <DialogTitle
            sx={{
              backgroundColor: "#4B49AC",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            Policy Details
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="subtitle1" fontWeight={600}>
              Title: {selectedPolicy.title}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              <strong>Description:</strong> {selectedPolicy.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography>Status: {selectedPolicy.status}</Typography>
            <Typography>
              Effective Date: {selectedPolicy.effectiveDate || "N/A"}
            </Typography>
            <Typography>Created By: {selectedPolicy.createdBy}</Typography>
            {selectedPolicy.decidedBy && (
              <>
                <Typography>Decided By: {selectedPolicy.decidedBy}</Typography>
                <Typography>
                  Decided At:{" "}
                  {selectedPolicy.decidedAt?.replace("T", " ").slice(0, 16) ||
                    "N/A"}
                </Typography>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDetails}>Close</Button>
          </DialogActions>
        </Dialog>
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
