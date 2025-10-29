import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

export default function SectionTabs({ value, onChange }) {
  const labels = [
    "Personal Details",
    "Contact Details",
    "Employment Details",
    "Salary Details",
    "Attendance Details",
    "Leave Details",
  ];

  return (
    <Box
      sx={{
        borderBottom: "1px solid #e6e8eb",
        bgcolor: "white",
        borderRadius: 2,
      }}
    >
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="employee sections"
        sx={{ px: 2 }}
      >
        {labels.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>
    </Box>
  );
}
