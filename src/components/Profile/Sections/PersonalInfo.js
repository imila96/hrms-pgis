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

export default function PersonalInfo({ user }) {
  const nameParts = (user?.name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";
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
          <Grid container spacing={3} direction={`column`}>
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
    </>
  );
}
