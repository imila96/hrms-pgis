import { Typography, Divider, Grid, Stack, Box } from "@mui/material";

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

export default function ContactInfo({ contacts = [] }) {
  const c = contacts && contacts.length > 0 ? contacts[0] : {};
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
        Contact Information
      </Typography>
      <Divider sx={{ mb: 4, borderColor: "#e6e9ff" }} />
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={6}>
          <Stack spacing={2.5}>
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
          <Stack spacing={2.5}>
            <Typography 
              variant="subtitle1" 
              fontWeight={700}
              sx={{ 
                mb: 1,
                color: "#7DA0FA",
                fontSize: "1.1rem"
              }}
            >
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
    </Box>
  );
}
