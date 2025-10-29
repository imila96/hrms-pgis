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
export default function PersonalInfo() {
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Personal Information
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container columnSpacing={"50%"}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction={`column`}>
            <Grid item xs={12}>
              <Field label="First Name" value="Olivia" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Last Name" value="Bennett" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Date of Birth" value="05/15/1990" />
            </Grid>
            <Grid item xs={12}>
              <Field label="NIC" value="1234567890" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Religion" value="Christian" />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Grid container spacing={3} direction={`column`}>
            <Grid item xs={12}>
              <Field label="Middle Name" value="M." />
            </Grid>
            <Grid item xs={12}>
              <Field label="Gender" value="Female" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Nationality" value="American" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Marital Status" value="Single" />
            </Grid>
            <Grid item xs={12}>
              <Field label="Blood Group" value="O+" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
