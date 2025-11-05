// src/components/EmployeeDashboard/Salary.js
import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
} from "@mui/material";
import BackButton from "../common/BackButton";

const Salary = () => {
  // Dummy salary data
  const salaryData = [
    { month: "January 2025", netPay: 60000, bonus: 5000, deductions: 2000 },
    { month: "February 2025", netPay: 62000, bonus: 4500, deductions: 1500 },
    { month: "March 2025", netPay: 61000, bonus: 5500, deductions: 1000 },
  ];

  return (
    <Box>
      <BackButton />
      <Paper sx={{ p: 3, maxWidth: 800 }}>
        <Typography variant="h6" gutterBottom>
          Salary Details
        </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell align="right">Net Pay (LKR)</TableCell>
              <TableCell align="right">Bonus (LKR)</TableCell>
              <TableCell align="right">Deductions (LKR)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {salaryData.map(({ month, netPay, bonus, deductions }) => (
              <TableRow key={month}>
                <TableCell>{month}</TableCell>
                <TableCell align="right">{netPay.toLocaleString()}</TableCell>
                <TableCell align="right">{bonus.toLocaleString()}</TableCell>
                <TableCell align="right">{deductions.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
    </Box>
  );
};

export default Salary;
