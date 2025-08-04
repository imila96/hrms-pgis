import React, { useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Alert,
} from "@mui/material";

const SystemLogs = () => {
  const [logs] = useState([
    { time: "2025-07-29 08:45 AM", message: "Admin logged in." },
    { time: "2025-07-29 08:50 AM", message: "User deleted: john@example.com" },
    { time: "2025-07-29 09:10 AM", message: "Backup completed successfully." },
    { time: "2025-07-29 09:30 AM", message: "System configuration updated." },
  ]);

  const [lastBackup, setLastBackup] = useState("2025-07-29 09:10 AM");
  const [backupMessage, setBackupMessage] = useState("");

  const handleBackup = () => {
    const now = new Date().toLocaleString();
    setLastBackup(now);
    setBackupMessage("Backup initiated successfully (mock).");
    setTimeout(() => setBackupMessage(""), 4000);
  };

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        System Logs & Backups
      </Typography>

      <Typography variant="h6" mt={3}>
        Logs
      </Typography>
      <Table sx={{ mb: 4 }}>
        <TableHead>
          <TableRow>
            <TableCell>Time</TableCell>
            <TableCell>Event</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {logs.map((log, index) => (
            <TableRow key={index}>
              <TableCell>{log.time}</TableCell>
              <TableCell>{log.message}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Typography variant="h6">Backup</Typography>
      <Typography variant="body2" mb={1}>
        Last Backup: <strong>{lastBackup}</strong>
      </Typography>
      <Button variant="contained" color="primary" onClick={handleBackup}>
        Trigger Backup
      </Button>

      {backupMessage && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {backupMessage}
        </Alert>
      )}
    </Box>
  );
};

export default SystemLogs;
