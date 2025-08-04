import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Select,
  MenuItem,
} from "@mui/material";

const initialApplications = [
  { id: 1, name: "Nimal Perera", job: "Software Engineer", status: "Applied" },
  { id: 2, name: "Dilani Silva", job: "HR Assistant", status: "Interviewed" },
  { id: 3, name: "Ruwan Fernando", job: "Accountant", status: "Rejected" },
];

const RecruitmentManagement = () => {
  const [applications, setApplications] = useState(initialApplications);

  const handleStatusChange = (id, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === id ? { ...app, status: newStatus } : app
      )
    );
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Recruitment Management
      </Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Candidate</strong></TableCell>
            <TableCell><strong>Job Title</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>{app.name}</TableCell>
              <TableCell>{app.job}</TableCell>
              <TableCell>
                <Select
                  value={app.status}
                  onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  size="small"
                >
                  <MenuItem value="Applied">Applied</MenuItem>
                  <MenuItem value="Interviewed">Interviewed</MenuItem>
                  <MenuItem value="Hired">Hired</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default RecruitmentManagement;

