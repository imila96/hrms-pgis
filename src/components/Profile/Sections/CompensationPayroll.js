import React from "react";
import { Typography, Divider, Grid } from "@mui/material";

const Field = ({ label, value }) => (
  <div>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1">{value || "-"}</Typography>
  </div>
);
export default function CompensationPayroll() {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Compensation & Payroll
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container columnSpacing={"50%"}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction={`column`}>
            <Grid item xs={12}>
              <Field label="Basic Salary" value="$5000" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Bank Name" value="BOC" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Branch" value="Main Branch" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Account Number" value="123456789" />
            </Grid>
            <Grid item xs={12}>
              <Field label="TIN" value="123-45-6789" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Pension Scheme" value="ABC Pension Plan" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
