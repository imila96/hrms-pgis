import React from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  useTheme,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const stats = [
  { label: "Total Users", value: 150 },
  { label: "Active Users", value: 75 },
  { label: "Backups", value: 12 },
  { label: "Issues", value: 4 },
];

const chartData = [
  { name: "Jan", users: 30 },
  { name: "Feb", users: 45 },
  { name: "Mar", users: 60 },
  { name: "Apr", users: 80 },
  { name: "May", users: 70 },
  { name: "Jun", users: 90 },
];

const Analytics = () => {
  const theme = useTheme();

  return (
    <Box>
      <Typography variant="h5" mb={3}>
        Analytics Overview
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        {stats.map(({ label, value }) => (
          <Grid item xs={12} sm={6} md={3} key={label}>
            <Paper elevation={3} sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6">{label}</Typography>
              <Typography variant="h4" color="primary">
                {value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Bar Chart */}
      <Typography variant="h6" mb={2}>
        Monthly Active Users
      </Typography>
      <Paper elevation={3} sx={{ p: 3 }}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="users" fill={theme.palette.primary.main} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default Analytics;
