// src/components/EmployeeDashboard/Policies.js
import React from "react";
import { Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

const Policies = () => {
  const policies = [
    {
      id: 1,
      title: "Work From Home Policy",
      content: "Employees can work from home up to 3 days a week with manager approval.",
    },
    {
      id: 2,
      title: "Leave Policy",
      content: "Annual leave entitlement is 14 days per year.",
    },
    {
      id: 3,
      title: "Code of Conduct",
      content: "All employees are expected to maintain professional behavior at work.",
    },
  ];

  return (
    <Paper sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h6" gutterBottom>
        Policies & Announcements
      </Typography>
      <List>
        {policies.map(({ id, title, content }) => (
          <ListItem key={id} divider>
            <ListItemText
              primary={title}
              secondary={content}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Policies;
