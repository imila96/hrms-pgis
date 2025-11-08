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
import { Lock } from "@mui/icons-material";
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
          bgcolor: "white",
          borderRadius: 3,
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <Tabs
          value={active}
          onChange={(_, v) => setActive(v)}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="employee sections"
          sx={{ 
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              minHeight: 56,
              color: "#64748b",
              "&.Mui-selected": {
                color: "#4B49AC",
              }
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#4B49AC",
              height: 3,
              borderRadius: "3px 3px 0 0",
            }
          }}
        >
          {tabs.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </Tabs>
        <Box sx={{ p: 3 }}>{tabs[active]?.content}</Box>
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
        bgcolor: "white",
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="employee sections"
        sx={{ 
          px: 2,
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            minHeight: 56,
            color: "#64748b",
            "&.Mui-selected": {
              color: "#4B49AC",
            }
          },
          "& .MuiTabs-indicator": {
            backgroundColor: "#4B49AC",
            height: 3,
            borderRadius: "3px 3px 0 0",
          }
        }}
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
    <Paper 
      sx={{ 
        p: 3, 
        bgcolor: "white",
        borderRadius: 3,
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        transition: "box-shadow 0.3s ease",
        "&:hover": {
          boxShadow: "0 4px 20px rgba(75,73,172,0.12)",
        }
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}
      >
        <Avatar
          src={user?.profileImage || undefined}
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            bgcolor: "#4B49AC",
            color: "#fff",
            fontSize: "2.5rem",
            fontWeight: 700,
            border: "4px solid #f0f2ff",
            boxShadow: "0 4px 12px rgba(75,73,172,0.2)",
          }}
        >
          {!user?.profileImage && (initials || "OB")}
        </Avatar>
        <Typography
          variant="h6"
          sx={{ 
            fontWeight: 700, 
            mb: 2, 
            textAlign: "center",
            color: "#4B49AC",
            fontSize: "1.25rem"
          }}
        >
          Employee Details
        </Typography>
        <Stack spacing={1.5} sx={{ width: "100%", mb: 3 }}>
          <Button
            variant="contained"
            size="medium"
            sx={{ 
              borderRadius: 2,
              bgcolor: "#4B49AC",
              textTransform: "none",
              fontWeight: 600,
              py: 1.2,
              "&:hover": {
                bgcolor: "#3d3a8f",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(75,73,172,0.3)",
              },
              transition: "all 0.2s ease"
            }}
            onClick={() =>
              isEmployeeRole
                ? navigate(`/employee/profile/edit/${empId}`)
                : navigate(`/hr/records/edit/${empId}`)
            }
          >
            Edit Profile
          </Button>
          {isEmployeeRole && (
            <Button
              variant="outlined"
              size="medium"
              startIcon={<Lock />}
              sx={{ 
                borderRadius: 2,
                borderColor: "#7DA0FA",
                color: "#7DA0FA",
                textTransform: "none",
                fontWeight: 600,
                py: 1.2,
                "&:hover": {
                  borderColor: "#4B49AC",
                  bgcolor: "#f8f9ff",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s ease"
              }}
              onClick={() => navigate("/employee/reset-password")}
            >
              Change Password
            </Button>
          )}
        </Stack>

        <Stack spacing={2} sx={{ width: "100%", color: "text.secondary" }}>
          <Box sx={{ 
            p: 2, 
            bgcolor: "#f8f9ff", 
            borderRadius: 2,
            borderLeft: "3px solid #4B49AC"
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ 
                textTransform: "uppercase", 
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                mb: 0.5,
                display: "block"
              }}
            >
              Full Name
            </Typography>
            <Typography fontWeight={600} fontSize="0.9rem" color="#2c3e50">
              {user?.name || "—"}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: "#f8f9ff", 
            borderRadius: 2,
            borderLeft: "3px solid #7DA0FA"
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ 
                textTransform: "uppercase", 
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                mb: 0.5,
                display: "block"
              }}
            >
              Job Title
            </Typography>
            <Typography fontWeight={600} fontSize="0.9rem" color="#2c3e50">
              {jobTitle || "—"}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: "#f8f9ff", 
            borderRadius: 2,
            borderLeft: "3px solid #7978E9"
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ 
                textTransform: "uppercase", 
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                mb: 0.5,
                display: "block"
              }}
            >
              Department
            </Typography>
            <Typography fontWeight={600} fontSize="0.9rem" color="#2c3e50">
              {dept || "—"}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: "#f8f9ff", 
            borderRadius: 2,
            borderLeft: "3px solid #F3797E"
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ 
                textTransform: "uppercase", 
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                mb: 0.5,
                display: "block"
              }}
            >
              Email
            </Typography>
            <Typography 
              fontWeight={600} 
              fontSize="0.85rem" 
              color="#2c3e50"
              sx={{ wordBreak: "break-word" }}
            >
              {email || "—"}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: "#f8f9ff", 
            borderRadius: 2,
            borderLeft: "3px solid #98BDFF"
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ 
                textTransform: "uppercase", 
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                mb: 0.5,
                display: "block"
              }}
            >
              Phone
            </Typography>
            <Typography fontWeight={600} fontSize="0.9rem" color="#2c3e50">
              {phone || "—"}
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            bgcolor: "#f8f9ff", 
            borderRadius: 2,
            borderLeft: "3px solid #4B49AC"
          }}>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ 
                textTransform: "uppercase", 
                fontSize: "0.65rem",
                letterSpacing: "0.5px",
                mb: 0.5,
                display: "block"
              }}
            >
              Employee ID
            </Typography>
            <Typography fontWeight={600} fontSize="0.9rem" color="#2c3e50">
              {empId || "—"}
            </Typography>
          </Box>
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
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 0, mb: 3 }} elevation={0}>
        <SectionTabs value={tab} onChange={(_, v) => setTab(v)} />
      </Paper>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "320px minmax(0, 840px)" },
          gap: 3,
          maxWidth: "100%",
        }}
      >
        <ProfileSidebar
          user={user}
          primaryEmployment={employments[0]}
          primaryContact={contacts[0]}
        />
        <Paper 
          sx={{ 
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
            transition: "box-shadow 0.3s ease",
            minWidth: 0,
            "&:hover": {
              boxShadow: "0 4px 20px rgba(75,73,172,0.12)",
            }
          }}
        >
          {tab === 0 && <PersonalInfo user={user} />}
          {tab === 1 && <ContactInfo contacts={contacts} />}
          {tab === 2 && <EmploymentInfo employments={employments} />}
          {tab === 3 && <CompensationPayroll compensations={compensations} />}
        </Paper>
      </Box>
    </Box>
  );
}
