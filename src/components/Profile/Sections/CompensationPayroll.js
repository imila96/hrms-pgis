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

export default function CompensationPayroll({ compensations = [] }) {
  const c = compensations && compensations.length > 0 ? compensations[0] : {};
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
        Compensation & Payroll
      </Typography>
      <Divider sx={{ mb: 4, borderColor: "#e6e9ff" }} />
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5} direction="column">
            <Grid item xs={12}>
              <Field label="Basic Salary" value={c.basicSalary} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Bank Name" value={c.bankName} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Branch" value={c.branch} />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={2.5} direction="column">
            <Grid item xs={12}>
              <Field label="Account Number" value={c.accountNo} />
            </Grid>
            <Grid item xs={12}>
              <Field label="TIN" value={c.tin} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Pension Scheme" value={c.pensionScheme} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
