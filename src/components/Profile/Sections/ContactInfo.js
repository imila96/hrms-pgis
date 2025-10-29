import React from "react";
import { Typography, Divider, Grid, Stack } from "@mui/material";

const Field = ({ label, value }) => (
  <div>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1">{value || "-"}</Typography>
  </div>
);

// export default function ContactInfo({ user }) {
//   return (
//     <>
//       <Typography variant="h5" sx={{ mb: 2 }}>
//         Contact Information
//       </Typography>
//       <Divider sx={{ mb: 3 }} />
//       <Grid container spacing={3}>
//         <Grid item xs={12} md={6}>
//           <Field label="Address" value={user?.address} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="City" value={user?.city} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="State" value={user?.state} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="Zip Code" value={user?.zipCode} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="Country" value={user?.country} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="Home Phone" value={user?.homePhone} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="Mobile Phone" value={user?.mobilePhone} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="Work Phone" value={user?.workPhone} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="Work Email" value={user?.email} />
//         </Grid>
//         <Grid item xs={12} md={6}>
//           <Field label="Other Email" value={user?.otherEmail} />
//         </Grid>
//       </Grid>
//     </>
//   );
// }

export default function ContactInfo() {
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
            <Field label="Address" value="123 Maple Street" />
            <Field label="City" value="Springfield" />
            <Field label="State" value="IL" />
            <Field label="Zip Code" value="62704" />
            <Field label="Country" value="USA" />
          </Stack>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3}>
            <Field label="Home Phone" value="+1-555-111-2222" />
            <Field label="Mobile Phone" value="+1-555-333-4444" />
            <Field label="Work Phone" value="+1-555-555-6666" />
            <Field label="Work Email" value="sophia.carter@example.com" />
            <Field label="Other Email" value="sophia.personal@example.com" />
          </Stack>
        </Grid>
      </Grid>
    </>
  );
}
