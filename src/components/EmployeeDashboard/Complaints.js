// src/components/EmployeeDashboard/Complaints.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, TextField,
  DialogActions, Snackbar, Alert, Stack, Chip, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

const statusChip = (s) => (
  <Chip label={s === "RESOLVED" ? "Resolved" : "Pending"} size="small"
        color={s === "RESOLVED" ? "success" : "warning"} />
);

export default function Complaints() {
  const [issues, setIssues] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newIssue, setNewIssue] = useState({ title: "", description: "" });
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

  const load = async () => {
    try {
      const params = statusFilter === "ALL" ? {} : { status: statusFilter };
      const { data } = await axiosInstance.get("/issues/my", { params });
      setIssues(data || []);
    } catch (e) {
      setSnack({ open: true, msg: `Failed to load: ${e.response?.status || e.message}`, sev: "error" });
    }
  };

  useEffect(() => { load(); /* on mount & filter change */ }, [statusFilter]);

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

  return (
    <Paper sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Complaints / Technical Issues</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="issue-filter">Status</InputLabel>
            <Select labelId="issue-filter" label="Status" value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="ALL">All</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="RESOLVED">Resolved</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" onClick={() => setOpen(true)}>Submit New Complaint</Button>
        </Stack>
      </Stack>

      <List>
        {issues.map((it) => (
          <ListItem key={it.id} divider
                    sx={{ backgroundColor: it.status === "RESOLVED" ? "#eaf7ea" : "#fff8e6", borderRadius: 1, mb: 1 }}>
            <ListItemText
              primary={<Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={600}>{it.title}</Typography>{statusChip(it.status)}
              </Stack>}
              secondary={it.description}
            />
          </ListItem>
        ))}
        {issues.length === 0 && <Typography color="text.secondary" sx={{ mt: 2 }}>No issues.</Typography>}
      </List>

      {/* Submit dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Submit Complaint</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField fullWidth label="Title" name="title" value={newIssue.title}
                     onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })} sx={{ mb: 2 }} />
          <TextField fullWidth label="Description" name="description" value={newIssue.description}
                     onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                     multiline rows={4} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!canSave || saving} variant="contained" onClick={onSubmit}>Submit</Button>
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
