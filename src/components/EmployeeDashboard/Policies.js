// src/components/EmployeeDashboard/Policies.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Stack, Chip, Snackbar, Alert, CircularProgress
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";

const getText = (obj, keys) =>
  keys.map(k => obj?.[k]).find(v => typeof v === "string" && v.trim().length);

const getDate = (obj, keys) => {
  const raw = keys.map(k => obj?.[k]).find(Boolean);
  return raw ? new Date(raw).toLocaleString() : "-";
};

const truncate = (s, n = 160) => (s && s.length > n ? s.slice(0, n) + "…" : s);

// ---- hydrate helpers: fetch details only when list is missing text ----
async function hydratePolicies(list) {
  // try to use summary from list first
  const base = list.map(p => ({
    ...p,
    summary: getText(p, ["summary", "description", "content"])
  }));
  const need = base.filter(p => !p.summary);

  if (need.length === 0) return base;

  const results = await Promise.all(
    need.map(p =>
      axiosInstance
        .get(`/policies/${p.id}`)
        .then(r => ({ id: p.id, d: r.data }))
        .catch(() => null)
    )
  );

  const map = new Map(results.filter(Boolean).map(x => [x.id, x.d]));
  return base.map(p => {
    if (p.summary) return p;
    const d = map.get(p.id) || {};
    const s = getText(d, ["summary", "description", "content", "body"]);
    return { ...p, summary: truncate(s) || "-" };
  });
}

async function hydrateAnnouncements(list) {
  const base = list.map(a => ({
    ...a,
    body: getText(a, ["message", "description", "content", "body"])
  }));
  const need = base.filter(a => !a.body);

  if (need.length === 0) return base;

  const results = await Promise.all(
    need.map(a =>
      axiosInstance
        .get(`/announcements/${a.id}`)
        .then(r => ({ id: a.id, d: r.data }))
        .catch(() => null)
    )
  );

  const map = new Map(results.filter(Boolean).map(x => [x.id, x.d]));
  return base.map(a => {
    if (a.body) return a;
    const d = map.get(a.id) || {};
    const s = getText(d, ["message", "description", "content", "body"]);
    return { ...a, body: truncate(s) || "-" };
  });
}

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [anncs, setAnncs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Approved & currently effective policies; Published announcements (public)
        const [pRes, aRes] = await Promise.all([
          axiosInstance.get("/policies", { params: { status: "APPROVED", effective: true } }),
          axiosInstance.get("/announcements/public"),
        ]);

        const [polFull, annFull] = await Promise.all([
          hydratePolicies(pRes.data || []),
          hydrateAnnouncements(aRes.data || []),
        ]);

        setPolicies(polFull);
        setAnncs(annFull);
      } catch (e) {
        setSnack({ open: true, msg: `Load failed: ${e.response?.status || e.message}`, sev: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const policyRows = useMemo(() => (policies || []).map(p => ({
    id: p.id,
    title: getText(p, ["title", "name"]),
    summary: p.summary || "-",
    effective: getDate(p, ["effectiveDate", "effectiveFrom", "publishedAt", "updatedAt", "createdAt"]),
  })), [policies]);

  const anncRows = useMemo(() => (anncs || []).map(a => ({
    id: a.id,
    title: getText(a, ["title", "subject"]),
    body: a.body || "-",
    time: getDate(a, ["publishedAt", "approvedAt", "createdAt"]),
    status: "PUBLISHED",
  })), [anncs]);

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading…</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      {/* POLICIES */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Company Policies</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="35%">Title</TableCell>
                <TableCell>Summary</TableCell>
                <TableCell width="22%">Effective / Published</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {policyRows.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{r.title}</TableCell>
                  <TableCell>{r.summary}</TableCell>
                  <TableCell>{r.effective}</TableCell>
                </TableRow>
              ))}
              {policyRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography color="text.secondary">No policies yet.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ANNOUNCEMENTS */}
      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h5">Announcements</Typography>
          <Chip size="small" color="success" label="Published Only" />
        </Stack>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell width="35%">Title</TableCell>
                <TableCell>Message</TableCell>
                <TableCell width="22%">Approved / Published</TableCell>
                <TableCell width="10%">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {anncRows.map(r => (
                <TableRow key={r.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{r.title}</TableCell>
                  <TableCell>{r.body}</TableCell>
                  <TableCell>{r.time}</TableCell>
                  <TableCell>
                    <Chip size="small" label={r.status} color="success" />
                  </TableCell>
                </TableRow>
              ))}
              {anncRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography color="text.secondary">No announcements.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.sev} sx={{ width: "100%" }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
