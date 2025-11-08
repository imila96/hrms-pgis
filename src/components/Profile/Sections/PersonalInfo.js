import React from "react";
import { Typography, Divider, Grid, Box } from "@mui/material";

const Field = ({ label, value }) => (
  <Box 
    sx={{ 
      p: 2.5,
      borderRadius: 2,
      bgcolor: "#f8f9ff",
      transition: "all 0.2s ease",
      "&:hover": {
        bgcolor: "#f0f2ff",
        transform: "translateX(4px)",
      }
    }}
  >
    <Typography 
      variant="caption" 
      color="text.secondary" 
      fontWeight={600}
      sx={{ 
        textTransform: "uppercase", 
        fontSize: "0.7rem",
        letterSpacing: "0.5px",
        mb: 0.5,
        display: "block"
      }}
    >
      {label}
    </Typography>
    <Typography 
      variant="body1" 
      fontWeight={600}
      sx={{ 
        fontSize: "0.95rem",
        color: "#2c3e50"
      }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

export default function PersonalInfo({ user }) {
  const nameParts = (user?.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
  return (
    <Box>
      <Typography 
        variant="h5" 
        fontWeight={700}
        sx={{ 
          mb: 3,
          color: "#4B49AC",
          fontSize: "1.5rem"
        }}
      >
        Personal Information
      </Typography>
      <Divider sx={{ mb: 4, borderColor: "#e6e9ff" }} />
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5} direction="column">
            <Grid item xs={12}>
              <Field label="First Name" value={firstName} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Last Name" value={lastName} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Date of Birth" value={user?.dateOfBirth} />
            </Grid>
            <Grid item xs={12}>
              <Field label="NIC" value={user?.nicNo || user?.nic} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Religion" value={user?.religion} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5} direction="column">
            <Grid item xs={12}>
              <Field label="Middle Name" value={user?.middleName} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Gender" value={user?.gender} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Nationality" value={user?.nationality} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Marital Status" value={user?.maritalStatus} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Blood Group" value={user?.bloodGroup} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
