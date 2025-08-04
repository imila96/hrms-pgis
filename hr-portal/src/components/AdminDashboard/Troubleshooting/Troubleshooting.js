import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Stack,
} from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";

const Troubleshooting = () => {
  const [issues, setIssues] = useState([
    {
      id: 1,
      description: "Login page throws 500 error occasionally.",
      submittedAt: "2025-07-25 10:20 AM",
      resolved: false,
    },
    {
      id: 2,
      description: "Password reset email not sent.",
      submittedAt: "2025-07-26 02:45 PM",
      resolved: false,
    },
    {
      id: 3,
      description: "User profile picture upload fails.",
      submittedAt: "2025-07-27 09:15 AM",
      resolved: true,
    },
  ]);

  const markResolved = (id) => {
    const updated = issues.map((issue) =>
      issue.id === id ? { ...issue, resolved: true } : issue
    );
    setIssues(updated);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Troubleshooting & Reported Issues
      </Typography>
      <List>
        {issues.map((issue) => (
          <ListItem
            key={issue.id}
            secondaryAction={
              !issue.resolved && (
                <IconButton edge="end" onClick={() => markResolved(issue.id)}>
                  <DoneIcon />
                </IconButton>
              )
            }
            sx={{
              backgroundColor: issue.resolved ? "#e0f7e9" : "#fff3e0",
              mb: 1,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <ListItemText
              primary={issue.description}
              secondary={
                <Stack direction="row" spacing={2}>
                  <Typography variant="caption">
                    Submitted at: {issue.submittedAt}
                  </Typography>
                  <Chip
                    label={issue.resolved ? "Resolved" : "Pending"}
                    color={issue.resolved ? "success" : "warning"}
                    size="small"
                  />
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Troubleshooting;
