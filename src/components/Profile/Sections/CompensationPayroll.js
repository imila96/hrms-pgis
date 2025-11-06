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

export default function CompensationPayroll({ compensations = [] }) {
  const c = compensations && compensations.length > 0 ? compensations[0] : {};
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
              <Field label="Basic Salary" value={c.basicSalary} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Bank Name" value={c.bankName} />
            </Grid>
            <Grid item xs={12}>
              <Field label="Branch" value={c.branch} />
            </Grid>
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
    </>
  );
}
