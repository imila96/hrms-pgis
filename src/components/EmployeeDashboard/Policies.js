// src/components/EmployeeDashboard/Policies.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Paper, Typography, Stack, Chip, Snackbar, Alert, CircularProgress,
  TextField, InputAdornment, Grid, Card, CardContent, CardActions, Button,
  Divider, Collapse, Box
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PolicyIcon from "@mui/icons-material/Policy";
import DescriptionIcon from "@mui/icons-material/Description";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CampaignIcon from "@mui/icons-material/Campaign";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axiosInstance from "../../AxiosInstance";

const getText = (obj, keys) => keys.map(k => obj?.[k]).find(v => typeof v === "string" && v.trim().length);
const getDateStr = (obj, keys) => {
  const raw = keys.map(k => obj?.[k]).find(Boolean);
  return raw ? new Date(raw).toLocaleString() : "-";
};
const truncate = (s, n = 200) => (s && s.length > n ? s.slice(0, n) + "…" : (s || "-"));

// ---- hydrate: pull details only when list lacks text ----
async function hydratePolicies(list) {
  const base = list.map(p => ({ ...p, _summary: getText(p, ["summary", "description", "content"]) }));
  const need = base.filter(p => !p._summary);
  if (need.length === 0) return base;

  const results = await Promise.all(
    need.map(p => axiosInstance.get(`/policies/${p.id}`).then(r => ({ id: p.id, d: r.data })).catch(() => null))
  );
  const map = new Map(results.filter(Boolean).map(x => [x.id, x.d]));
  return base.map(p => {
    if (p._summary) return p;
    const d = map.get(p.id) || {};
    return { ...p, _summary: getText(d, ["summary", "description", "content", "body"]) || "-" };
  });
}

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

export default function Policies() {
  const [policies, setPolicies] = useState([]);
  const [anncs, setAnncs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, msg: "", sev: "error" });
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState({}); // policy id -> bool

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, aRes] = await Promise.all([
          axiosInstance.get("/policies", { params: { status: "APPROVED", effective: true } }),
          axiosInstance.get("/announcements/public"),
        ]);
        const [pFull, aFull] = await Promise.all([
          hydratePolicies(pRes.data || []),
          hydrateAnnouncements(aRes.data || []),
        ]);
        // newest first
        const sortByDateDesc = (arr, keys) =>
          [...arr].sort((a, b) => new Date(getFirst(a, keys)) - new Date(getFirst(b, keys))).reverse();
        const getFirst = (obj, keys) => keys.map(k => obj?.[k]).find(Boolean) || 0;

        setPolicies(sortByDateDesc(pFull, ["effectiveDate", "effectiveFrom", "updatedAt", "createdAt"]));
        setAnncs(sortByDateDesc(aFull, ["publishedAt", "approvedAt", "createdAt"]));
      } catch (e) {
        setSnack({ open: true, msg: `Load failed: ${e.response?.status || e.message}`, sev: "error" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredPolicies = useMemo(() => {
    const qq = q.toLowerCase();
    return (policies || []).filter(p =>
      (p.title || "").toLowerCase().includes(qq) ||
      (p._summary || "").toLowerCase().includes(qq)
    );
  }, [policies, q]);

  const filteredAnncs = useMemo(() => {
    const qq = q.toLowerCase();
    return (anncs || []).filter(a =>
      (a.title || "").toLowerCase().includes(qq) ||
      (a._body || "").toLowerCase().includes(qq)
    );
  }, [anncs, q]);

  const PolicyCard = ({ p }) => {
    const eff = getDateStr(p, ["effectiveDate", "effectiveFrom", "publishedAt", "updatedAt", "createdAt"]);
    const open = !!expanded[p.id];
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          position: "relative",
          bgcolor: "background.paper",
          "&:before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, rgba(33,150,243,0.06), rgba(76,175,80,0.06))",
            pointerEvents: "none",
          },
        }}
      >
        <Box sx={{ px: 2, pt: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.main", color: "primary.contrastText" }}>
              <PolicyIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.title}</Typography>
          </Stack>
        </Box>
        <CardContent sx={{ pt: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <CalendarMonthIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary">Effective: {eff}</Typography>
          </Stack>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {truncate(p._summary, open ? 10000 : 220)}
          </Typography>
          <Collapse in={open} timeout="auto" unmountOnExit />
        </CardContent>
        <CardActions sx={{ justifyContent: "space-between", pt: 0, pb: 2, px: 2 }}>
          <Chip size="small" color="success" label="Approved" />
          <Button
            size="small"
            endIcon={<ExpandMoreIcon sx={{ transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }} />}
            onClick={() => setExpanded(s => ({ ...s, [p.id]: !open }))}
          >
            {open ? "Show less" : "Read more"}
          </Button>
        </CardActions>
      </Card>
    );
  };

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
        <Typography sx={{ mt: 2 }}>Loading…</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      {/* Header / Search */}
      <Paper
        sx={{
          p: 2.5, borderRadius: 3,
          background: "linear-gradient(90deg, rgba(33,150,243,0.12), rgba(76,175,80,0.12))",
          border: "1px solid", borderColor: "divider",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }} justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Policies & Announcements</Typography>
            <Chip label={`Policies: ${policies.length}`} size="small" />
            <Chip label={`Announcements: ${anncs.length}`} size="small" color="success" />
          </Stack>
          <TextField
            size="small"
            placeholder="Search titles or text…"
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

      {/* POLICIES – Cards grid */}
      <Stack spacing={1} sx={{ px: 0.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, px: 0.5 }}>Company Policies</Typography>
        <Grid container spacing={2}>
          {filteredPolicies.map((p) => (
            <Grid item key={p.id} xs={12} md={6} lg={4}>
              <PolicyCard p={p} />
            </Grid>
          ))}
          {filteredPolicies.length === 0 && (
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography color="text.secondary">No policies match your search.</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Stack>

      <Divider sx={{ my: 1 }} />

      {/* ANNOUNCEMENTS – Timeline list */}
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Announcements</Typography>
          <Chip size="small" color="success" label="Published Only" />
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
  );
}
