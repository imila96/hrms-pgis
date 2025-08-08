// src/components/EmployeeDashboard/Reports.js
import React from "react";
import { Paper, Typography, List, ListItem, ListItemText, IconButton, Link } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const Reports = () => {
  const reports = [
    { id: 1, name: "Annual Performance 2024", fileUrl: "/reports/annual-performance-2024.pdf" },
    { id: 2, name: "Salary Slip March 2025", fileUrl: "/reports/salary-slip-mar-2025.pdf" },
    { id: 3, name: "Leave Summary 2024", fileUrl: "/reports/leave-summary-2024.pdf" },
  ];

  return (
    <Paper sx={{ p: 3, maxWidth: 700 }}>
      <Typography variant="h6" gutterBottom>
        Public Reports
      </Typography>
      <List>
        {reports.map(({ id, name, fileUrl }) => (
          <ListItem
            key={id}
            secondaryAction={
              <IconButton
                edge="end"
                component={Link}
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="download"
              >
                <DownloadIcon />
              </IconButton>
            }
          >
            <ListItemText primary={name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Reports;
