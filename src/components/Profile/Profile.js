import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Button,
} from "@mui/material";
import axiosInstance from "../../AxiosInstance";
import ProfileSidebar from "../Profile/ProfileSidebar";
import SectionTabs from "../Profile/SectionTabs";
import PersonalInfo from "../Profile/Sections/PersonalInfo";
import ContactInfo from "../Profile/Sections/ContactInfo";
import CompensationPayroll from "../Profile/Sections/CompensationPayroll";

export default function Profile() {
  const [tab, setTab] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, []);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/hr/employees/me");
      setUser(data);
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

  // return (
  //   <Box sx={{ py: 3 }}>
  //     {/* Notifications */}
  //     <Snackbar
  //       open={success}
  //       autoHideDuration={3000}
  //       onClose={() => setSuccess(false)}
  //       anchorOrigin={{ vertical: "top", horizontal: "center" }}
  //     >
  //       <Alert severity="success" onClose={() => setSuccess(false)}>
  //         Profile updated successfully!
  //       </Alert>
  //     </Snackbar>

  //     {/* Section Tabs */}
  //     <Paper sx={{ p: 0, mb: 2 }} elevation={0}>
  //       <SectionTabs value={tab} onChange={(_, v) => setTab(v)} />
  //     </Paper>

  //     {/* Profile Layout */}
  //     <Box
  //       sx={{
  //         display: "grid",
  //         gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
  //         gap: 3,
  //       }}
  //     >
  //       {/* Sidebar */}
  //       <ProfileSidebar user={user} />

  //       {/* Details Section */}
  //       <Paper sx={{ p: { xs: 2, md: 3 } }}>
  //         {tab === 0 && <PersonalInfo user={user} />}
  //         {tab === 1 && <ContactInfo user={user} />}
  //         {tab === 2 && (
  //           <>
  //             <Typography variant="h5" sx={{ mb: 2 }}>
  //               Employment Details
  //             </Typography>
  //             <Typography>Department: {user.department}</Typography>
  //             <Typography>Position: {user.jobTitle}</Typography>
  //             <Typography>Date Hired: {user.hireDate}</Typography>
  //           </>
  //         )}
  //         {tab === 3 && <CompensationPayroll user={user} />}
  //         {tab === 4 && (
  //           <>
  //             <Typography variant="h5">Attendance Details</Typography>
  //             <Typography sx={{ mt: 1 }}>Coming soon...</Typography>
  //           </>
  //         )}
  //         {tab === 5 && (
  //           <>
  //             <Typography variant="h5">Leave Details</Typography>
  //             <Typography sx={{ mt: 1 }}>Coming soon...</Typography>
  //           </>
  //         )}
  //       </Paper>
  //     </Box>
  //   </Box>
  // );
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
        <ProfileSidebar />
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          {tab === 0 && <PersonalInfo />}
          {tab === 1 && <ContactInfo />}
          {tab === 2 && (
            <Typography variant="h5">Employment Details</Typography>
          )}
          {tab === 3 && <CompensationPayroll />}
          {tab === 4 && (
            <Typography variant="h5">Attendance Details</Typography>
          )}
          {tab === 5 && <Typography variant="h5">Leave Details</Typography>}
        </Paper>
      </Box>
    </>
  );
}
