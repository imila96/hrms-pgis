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

export default function CompensationPayroll({ user }) {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Compensation & Payroll
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Field label="Salary" value={user?.salary} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Field label="Bank Account" value={user?.bankAccount} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Field label="Pay Grade" value={user?.payGrade} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Field label="Tax ID" value={user?.taxId} />
        </Grid>
      </Grid>
    </>
  );
}
