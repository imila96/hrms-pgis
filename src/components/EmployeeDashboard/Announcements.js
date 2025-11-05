// src/components/EmployeeDashboard/Announcements.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, Stack, Chip, Snackbar, Alert, CircularProgress,
  TextField, InputAdornment, Box
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CampaignIcon from "@mui/icons-material/Campaign";
import axiosInstance from "../../AxiosInstance";
import BackButton from "../common/BackButton";

const getText = (obj, keys) => keys.map(k => obj?.[k]).find(v => typeof v === "string" && v.trim().length);
const getDateStr = (obj, keys) => {
  const raw = keys.map(k => obj?.[k]).find(Boolean);
  return raw ? new Date(raw).toLocaleString() : "-";
};
const truncate = (s, n = 200) => (s && s.length > n ? s.slice(0, n) + "…" : (s || "-"));

// ---- hydrate: pull details only when list lacks text ----
async function hydrateAnnouncements(list) {
  const base = list.map(a => ({ ...a, _body: getText(a, ["message", "description", "content", "body"]) }));
  const need = base.filter(a => !a._body);
  if (need.length === 0) return base;

  const results = await Promise.all(
    need.map(a => axiosInstance.get(`/announcements/${a.id}`).then(r => ({ id: a.id, d: r.data })).catch(() => null))
  );
  const map = new Map(results.filter(Boolean).map(x => [x.id, x.d]));
  return base.map(a => {
    if (a._body) return a;
    const d = map.get(a.id) || {};
    return { ...a, _body: getText(d, ["message", "description", "content", "body"]) || "-" };
  });
}

export default function Announcements() {
  const [anncs, setAnncs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const aRes = await axiosInstance.get("/announcements/public");
        const aFull = await hydrateAnnouncements(aRes.data || []);
        
        // newest first
        const sortByDateDesc = (arr, keys) =>
          [...arr].sort((a, b) => new Date(getFirst(a, keys)) - new Date(getFirst(b, keys))).reverse();
        const getFirst = (obj, keys) => keys.map(k => obj?.[k]).find(Boolean) || 0;

        setAnncs(sortByDateDesc(aFull, ["publishedAt", "approvedAt", "createdAt"]));
      } catch (e) {
        setSnack({ open: true, msg: `Load failed: ${e.response?.status || e.message}`, sev: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredAnncs = useMemo(() => {
    const qq = q.toLowerCase();
    return (anncs || []).filter(a =>
      (a.title || "").toLowerCase().includes(qq) ||
      (a._body || "").toLowerCase().includes(qq)
    );
  }, [anncs, q]);

  const AnnouncementRow = ({ a, last }) => {
    const t = getDateStr(a, ["publishedAt", "approvedAt", "createdAt"]);
    return (
      <Stack direction="row" spacing={2} sx={{ position: "relative", pl: 4 }}>
        {/* timeline dot */}
        <Box sx={{
          position: "absolute", left: 6, top: 6, width: 10, height: 10, borderRadius: "50%",
          bgcolor: "success.main", boxShadow: 1
        }}/>
        {/* timeline line */}
        {!last && (
          <Box sx={{
            position: "absolute", left: 10, top: 20, bottom: -8, width: 2, bgcolor: "divider"
          }}/>
        )}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, flex: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: "success.main", color: "success.contrastText" }}>
                <CampaignIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{a.title}</Typography>
            </Stack>
            <Chip size="small" color="success" label="PUBLISHED" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <DescriptionIcon fontSize="small" color="disabled" />
            <Typography variant="body2" color="text.secondary">{truncate(a._body, 240)}</Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <CalendarMonthIcon fontSize="small" />
            <Typography variant="caption" color="text.secondary">{t}</Typography>
          </Stack>
        </Paper>
      </Stack>
    );
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading announcements…</Typography>
      </Stack>
    );
  }

  return (
    <Box>
      <BackButton />
      <Stack spacing={4}>
        {/* Header / Search */}
        <Paper
          sx={{
            p: 2.5, borderRadius: 3,
            background: "linear-gradient(90deg, rgba(76,175,80,0.12), rgba(33,150,243,0.12))",
            border: "1px solid", borderColor: "divider",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Company Announcements</Typography>
              <Chip label={`Total: ${anncs.length}`} size="small" color="success" />
            </Stack>
            <TextField
              size="small"
              placeholder="Search announcements…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 280 }}
            />
          </Stack>
        </Paper>

        {/* ANNOUNCEMENTS – Timeline list */}
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Published Announcements</Typography>
            <Chip size="small" color="success" label="Latest Updates" />
          </Stack>
          <Stack spacing={2} sx={{ pt: 0.5 }}>
            {filteredAnncs.map((a, i) => (
              <AnnouncementRow key={a.id} a={a} last={i === filteredAnncs.length - 1} />
            ))}
            {filteredAnncs.length === 0 && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">No announcements match your search.</Typography>
              </Paper>
            )}
          </Stack>
        </Stack>

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
    </Box>
  );
}
