// src/components/DirectorDashboard/PersonnelOversight.js
import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import axiosInstance from "../../AxiosInstance";

export default function PersonnelOversight() {
  const [employees, setEmployees] = useState([]);

  const load = async () => {
    try {
      const { data } = await axiosInstance.get("http://localhost:8080/hr/employees");
      setEmployees(data);
    } catch (e) {
      // keep read-only—no snackbar to keep it quiet
      // console.error(e);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Box>
      <Typography variant="h5" mb={2}>Personnel Oversight</Typography>
      <Paper sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Contact</strong></TableCell>
              <TableCell><strong>Position</strong></TableCell>
              <TableCell><strong>Hire Date</strong></TableCell>
              <TableCell><strong>Address</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow><TableCell colSpan={6} align="center">No employees</TableCell></TableRow>
            ) : employees.map(e => (
              <TableRow key={e.id}>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell>{e.contact}</TableCell>
                <TableCell>{e.jobTitle}</TableCell>
                <TableCell>{e.hireDate}</TableCell>
                <TableCell>{e.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}