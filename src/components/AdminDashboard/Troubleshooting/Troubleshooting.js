import React, { useEffect, useState } from "react";
import {
  Box, Typography, List, ListItem, ListItemText, IconButton,
  Chip, Stack, Snackbar, Alert, Select, MenuItem, FormControl, InputLabel, Tooltip
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import axiosInstance from "../../../AxiosInstance";

const chip = (s) => (
  <Chip label={s === "RESOLVED" ? "Resolved" : "Pending"} size="small"
        color={s === "RESOLVED" ? "success" : "warning"} />
);

export default function Troubleshooting() {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const load = async () => {
    try {
      const params = statusFilter === "ALL" ? {} : { status: statusFilter };
      const { data } = await axiosInstance.get("/issues", { params });
      setIssues(data || []);
    } catch (e) {
      setSnack({ open: true, msg: `Load failed: ${e.response?.status || e.message}`, sev: "error" });
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const resolveOne = async (id) => {
    try {
      await axiosInstance.patch(`/issues/${id}/resolve`);
      setSnack({ open: true, msg: "Marked as resolved.", sev: "success" });
      await load();
    } catch (e) {
      setSnack({ open: true, msg: `Update failed: ${e.response?.status || e.message}`, sev: "error" });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Troubleshooting & Reported Issues</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="admin-issue-filter">Status</InputLabel>
          <Select labelId="admin-issue-filter" label="Status" value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}>
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <List>
        {issues.map((it) => (
          <ListItem key={it.id} divider sx={{ background: it.status === "RESOLVED" ? "#eaf7ea" : "#fff8e6", mb: 1, borderRadius: 1 }}>
            <ListItemText
              primary={<Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={600}>{it.title}</Typography>{chip(it.status)}
              </Stack>}
              secondary={it.description}
            />
            {it.status === "PENDING" && (
              <Tooltip title="Mark resolved">
                <IconButton onClick={() => resolveOne(it.id)}><DoneIcon /></IconButton>
              </Tooltip>
            )}
          </ListItem>
        ))}
        {issues.length === 0 && <Typography color="text.secondary" sx={{ mt: 2 }}>No issues.</Typography>}
      </List>

      <Snackbar open={snack.open} autoHideDuration={3500} onClose={() => setSnack({ ...snack, open: false })}>
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
