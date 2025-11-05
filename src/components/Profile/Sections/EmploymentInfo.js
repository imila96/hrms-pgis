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
export default function EmploymentInfo() {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Employment Information
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container columnSpacing={"50%"}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction={`column`}>
            <Grid item xs={12}>
              <Field label="Employee Id" value="E12345" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Job Title" value="Software Engineer" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Department" value="IT" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Employment Type" value="Full-time" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Date of Joining" value="01/01/2020" />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction={`column`}>
            <Grid item xs={12}>
              <Field label="Probation End Date" value="06/30/2020" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Confirmation Date" value="07/01/2020" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Date of Retirement" value="12/31/2030" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Employment Status" value="Active" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
