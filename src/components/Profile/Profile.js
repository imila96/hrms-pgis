import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Avatar,
  Stack,
  Tabs,
  Tab,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";
import { useAuth } from "../../context/AuthContext";
import PersonalInfo from "./Sections/PersonalInfo";
import ContactInfo from "./Sections/ContactInfo";
import CompensationPayroll from "./Sections/CompensationPayroll";
import EmploymentInfo from "./Sections/EmploymentInfo";

// SectionTabs component
export function SectionTabs(props) {
  const { tabs, value, onChange } = props;
  const isTabsMode = Array.isArray(tabs);
  const [active, setActive] = React.useState(0);
  if (isTabsMode) {
    return (
      <Box
        sx={{
          borderBottom: "1px solid #e6e8eb",
          bgcolor: "white",
          borderRadius: 2,
        }}
      >
        <Tabs
          value={active}
          onChange={(_, v) => setActive(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="employee sections"
          sx={{ px: 2 }}
        >
          {tabs.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </Tabs>
        <Box sx={{ p: 2 }}>{tabs[active]?.content}</Box>
      </Box>
    );
  }

  const labels = [
    "Personal Details",
    "Contact Details",
    "Employment Details",
    "Salary Details",
  ];
  return (
    <Box
      sx={{
        borderBottom: "1px solid #e6e8eb",
        bgcolor: "white",
        borderRadius: 2,
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="employee sections"
        sx={{ px: 2 }}
      >
        {labels.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
    </Box>
  );
}

// ProfileSidebar component
export function ProfileSidebar({ user, primaryEmployment, primaryContact }) {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const isEmployeeRole =
    (authUser && authUser.activeRole === "employee") || false;
  const initials = (user?.name || "")
    .split(" ")
    .map((s) => s[0])
    .join("");
  const jobTitle =
    primaryEmployment?.jobTitle || primaryEmployment?.designation || "";
  const dept = primaryEmployment?.department || "";
  const email =
    user?.email ||
    primaryContact?.workEmail ||
    primaryContact?.personalEmail ||
    "";
  const phone =
    primaryContact?.mobileNumber || primaryContact?.homeTelephone || "";
  const empId = user?.id || user?.employeeId || "";

  return (
    <Paper sx={{ p: 3, bgcolor: "white" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}
      >
        <Avatar
          src={user?.profileImage || undefined}
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            bgcolor: "#fde7e9",
            color: "#222",
          }}
        >
          {!user?.profileImage && (initials || "OB")}
        </Avatar>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}
        >
          Employee Details
        </Typography>
        <Button
          variant="outlined"
          size="small"
          sx={{ borderRadius: 2, mb: 3 }}
          onClick={() =>
            isEmployeeRole
              ? navigate(`/employee/profile/edit/${empId}`)
              : navigate(`/hr/records/edit/${empId}`)
          }
        >
          Edit Profile
        </Button>

        <Stack spacing={1.2} sx={{ width: "100%", color: "text.secondary" }}>
          <Typography>{user?.name || "-"}</Typography>
          <Typography>{jobTitle || "-"}</Typography>
          <Typography>{dept || "-"}</Typography>
          <Typography>{email || "-"}</Typography>
          <Typography>{phone || "-"}</Typography>
          <Typography>{empId || "-"}</Typography>
        </Stack>
      </Box>
    </Paper>
  );
}

// Main Profile view
export default function Profile() {
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [employments, setEmployments] = useState([]);
  const [compensations, setCompensations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/hr/employees/me");
      setUser(data);
      const empId = data?.id || data?.employeeId;
      if (empId) {
        try {
          const [cRes, eRes, compRes] = await Promise.all([
            axiosInstance.get(`/profile/contacts`).catch(() => ({ data: [] })),
            axiosInstance
              .get(`/profile/employments`)
              .catch(() => ({ data: [] })),
            axiosInstance
              .get(`/profile/compensations`)
              .catch(() => ({ data: [] })),
          ]);
          setContacts(cRes.data || []);
          setEmployments(eRes.data || []);
          setCompensations(compRes.data || []);
        } catch (subErr) {
          console.error("Failed to load sub-resources", subErr);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load employee profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper
        sx={{ p: 5, maxWidth: 720, mx: "auto", mt: 5, textAlign: "center" }}
      >
        <Alert severity="error">{error}</Alert>
        <Button variant="contained" sx={{ mt: 2 }} onClick={fetchEmployee}>
          Retry
        </Button>
      </Paper>
    );
  }

  if (!user) {
    return (
      <Paper
        sx={{ p: 5, maxWidth: 720, mx: "auto", mt: 5, textAlign: "center" }}
      >
        <Typography variant="h6">No employee data found</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ p: 0, mb: 2 }} elevation={0}>
        <SectionTabs value={tab} onChange={(_, v) => setTab(v)} />
      </Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
          gap: 3,
        }}
      >
        <ProfileSidebar
          user={user}
          primaryEmployment={employments[0]}
          primaryContact={contacts[0]}
        />
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 && <PersonalInfo user={user} />}
          {tab === 1 && <ContactInfo contacts={contacts} />}
          {tab === 2 && <EmploymentInfo employments={employments} />}
          {tab === 3 && <CompensationPayroll compensations={compensations} />}
        </Paper>
      </Box>
    </>
  );
}
