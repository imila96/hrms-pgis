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

export default function EmploymentInfo({ employments = [] }) {
  const e = employments && employments.length > 0 ? employments[0] : {};
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
        Employment Information
      </Typography>
      <Divider sx={{ mb: 4, borderColor: "#e6e9ff" }} />
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5} direction="column">
            <Grid item xs={12}>
              <Field
                label="Employee Id"
                value={e.employeeId || e.employee?.employeeId}
              />
            </Grid>
            <Grid item xs={12}>
              <Field label="Job Title" value={e.jobTitle} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Department" value={e.department} />
            </Grid>
            <Grid item xs={12}>
              <Field
                label="Employment Type"
                value={e.employmentType || e.employmentStatus}
              />
            </Grid>
            <Grid item xs={12}>
              <Field label="Date of Joining" value={e.dateOfJoining} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5} direction="column">
            <Grid item xs={12}>
              <Field label="Probation End Date" value={e.probationEndDate} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Confirmation Date" value={e.confirmationDate} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Date of Retirement" value={e.dateOfRetirement} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Employment Status" value={e.employmentStatus} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
