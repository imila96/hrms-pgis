import { Typography, Divider, Grid, Stack } from "@mui/material";

const Field = ({ label, value }) => (
  <div>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1">{value || "-"}</Typography>
  </div>
);

export default function ContactInfo({ contacts = [] }) {
  const c = contacts && contacts.length > 0 ? contacts[0] : {};
  return (
    <>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Contact Information
      </Typography>
      <Divider sx={{ mb: 3 }} />
      <Grid container spacing={"50%"}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2 }}></Typography>
            <Field label="Permanent Address" value={c.permanentAddress} />
            <Field label="Current Address" value={c.currentAddress} />
            <Field label="Home Phone" value={c.homeTelephone} />
            <Field label="Mobile Phone" value={c.mobileNumber} />
            <Field label="Work Email" value={c.workEmail} />
            <Field label="Personal Email" value={c.personalEmail} />
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Emergency Contact Information
            </Typography>
            <Field label="Emergency Contact Name" value={c.emergencyName} />
            <Field
              label="Emergency Contact Relationship"
              value={c.emergencyRelationship}
            />
            <Field label="Emergency Phone" value={c.emergencyPhone} />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
