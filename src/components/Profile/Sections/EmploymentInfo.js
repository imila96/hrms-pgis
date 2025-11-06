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

export default function EmploymentInfo({ employments = [] }) {
  const e = employments && employments.length > 0 ? employments[0] : {};
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
          <Grid container spacing={3} direction={`column`}>
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
    </>
  );
}
