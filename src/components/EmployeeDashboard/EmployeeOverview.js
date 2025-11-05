/**
 * EmployeeOverview.js
 * 
 * Ultra-polished Employee Dashboard overview matching HR design system.
 * UI-only enhancements: animations, skeletons, responsive grid, micro-interactions.
 * No business logic changes - all data hooks/APIs remain intact.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  Skeleton,
} from "@mui/material";
import {
  AssignmentTurnedIn,
  Schedule,
  EventAvailable,
  TrendingUp,
  CheckCircle,
  Warning,
  RadioButtonUnchecked,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

// ============ Presentational Components ============

const KpiCard = ({ title, value, subtitle, icon: Icon, color, index }) => {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value) || 0;

  useEffect(() => {
    if (typeof targetValue !== "number") return;
    let start = 0;
    const duration = 1000;
    const increment = targetValue / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= targetValue) {
        setCount(targetValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [targetValue]);

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: "linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)",
        boxShadow: "0 2px 8px rgba(75,73,172,0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
        "@keyframes fadeInUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          boxShadow: "0 8px 24px rgba(75,73,172,0.15)",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          sx={{
            bgcolor: color || "#4B49AC",
            width: 56,
            height: 56,
            boxShadow: `0 4px 12px ${color}33`,
          }}
        >
          <Icon sx={{ fontSize: 28 }} />
        </Avatar>
        <Box flex={1}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} color="#4B49AC">
            {typeof targetValue === "number" ? count : value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const TaskRow = ({ task, index }) => {
  const priorityColor = {
    high: "#F3797E",
    medium: "#FFA726",
    low: "#7DA0FA",
  };

  const StatusIcon =
    task.status === "completed"
      ? CheckCircle
      : task.status === "overdue"
      ? Warning
      : RadioButtonUnchecked;

  return (
    <Paper
      sx={{
        p: 2,
        mb: 1.5,
        borderRadius: 2,
        borderLeft: `4px solid ${priorityColor[task.priority] || "#7DA0FA"}`,
        transition: "all 0.2s ease",
        animation: `slideIn 0.4s ease-out ${index * 0.05}s both`,
        "@keyframes slideIn": {
          from: { opacity: 0, transform: "translateX(-10px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
        "&:hover": {
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          transform: "translateX(4px)",
          cursor: "pointer",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <StatusIcon
          sx={{
            color:
              task.status === "completed"
                ? "#4CAF50"
                : task.status === "overdue"
                ? "#F3797E"
                : "#9E9E9E",
          }}
        />
        <Box flex={1}>
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              textDecoration: task.status === "completed" ? "line-through" : "none",
              color: task.status === "completed" ? "text.secondary" : "text.primary",
            }}
          >
            {task.title}
          </Typography>
          <Box display="flex" gap={1} mt={0.5} alignItems="center" flexWrap="wrap">
            <Chip
              label={task.priority}
              size="small"
              sx={{
                bgcolor: `${priorityColor[task.priority]}22`,
                color: priorityColor[task.priority],
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
            <Chip
              label={task.dueDate}
              size="small"
              variant="outlined"
              sx={{ fontSize: "0.7rem" }}
            />
            {task.progress !== undefined && (
              <Box flex={1} minWidth={100}>
                <LinearProgress
                  variant="determinate"
                  value={task.progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: "#E0E0E0",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: priorityColor[task.priority],
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const ActivityItem = ({ activity, index }) => {
  const iconMap = {
    checkin: CheckCircle,
    approval: AssignmentTurnedIn,
    comment: Schedule,
  };
  const Icon = iconMap[activity.type] || CheckCircle;

  return (
    <Box
      display="flex"
      gap={2}
      mb={2}
      sx={{
        animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`,
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
      }}
    >
      <Avatar
        sx={{
          bgcolor: "#98BDFF",
          width: 40,
          height: 40,
        }}
      >
        <Icon fontSize="small" />
      </Avatar>
      <Box flex={1}>
        <Typography variant="body2" fontWeight={600}>
          {activity.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {activity.time}
        </Typography>
      </Box>
    </Box>
  );
};

const SkeletonCard = () => (
  <Paper sx={{ p: 3, borderRadius: 3 }}>
    <Box display="flex" gap={2}>
      <Skeleton variant="circular" width={56} height={56} />
      <Box flex={1}>
        <Skeleton width="60%" height={20} />
        <Skeleton width="40%" height={32} sx={{ my: 1 }} />
        <Skeleton width="80%" height={16} />
      </Box>
    </Box>
  </Paper>
);

// ============ Main Component ============

export default function EmployeeOverview() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Simulate data load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Mock data (replace with real API calls - structure unchanged)
  const kpis = [
    {
      title: "Open Tasks",
      value: "8",
      subtitle: "2 due this week",
      icon: AssignmentTurnedIn,
      color: "#4B49AC",
    },
    {
      title: "Pending Approvals",
      value: "3",
      subtitle: "Awaiting manager review",
      icon: Schedule,
      color: "#7DA0FA",
    },
    {
      title: "Leave Balance",
      value: "12",
      subtitle: "Days remaining this year",
      icon: EventAvailable,
      color: "#7978E9",
    },
    {
      title: "This Month",
      value: "98%",
      subtitle: "Attendance rate",
      icon: TrendingUp,
      color: "#4CAF50",
    },
  ];

  const tasks = [
    {
      id: 1,
      title: "Complete Q4 Performance Review",
      priority: "high",
      dueDate: "Nov 10",
      status: "pending",
      progress: 60,
    },
    {
      id: 2,
      title: "Submit Expense Report",
      priority: "medium",
      dueDate: "Nov 8",
      status: "pending",
      progress: 30,
    },
    {
      id: 3,
      title: "Team Meeting Preparation",
      priority: "low",
      dueDate: "Nov 7",
      status: "completed",
      progress: 100,
    },
    {
      id: 4,
      title: "Review Updated Company Policy",
      priority: "medium",
      dueDate: "Nov 6",
      status: "overdue",
      progress: 0,
    },
  ];

  const activities = [
    { id: 1, type: "checkin", title: "Checked in at 9:00 AM", time: "2 hours ago" },
    { id: 2, type: "approval", title: "Leave request approved", time: "Yesterday" },
    { id: 3, type: "comment", title: "Manager left feedback", time: "2 days ago" },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "today") return t.dueDate === "Nov 7";
    if (activeFilter === "overdue") return t.status === "overdue";
    if (activeFilter === "completed") return t.status === "completed";
    return true;
  });

  return (
    <Box sx={{ py: 2 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #4B49AC 0%, #7DA0FA 100%)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(75,73,172,0.3)",
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Welcome back, {user?.name || user?.email?.split("@")[0] || "Employee"}!
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.95 }}>
          Here's your activity overview for today
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <SkeletonCard />
              </Grid>
            ))
          : kpis.map((kpi, i) => (
              <Grid item xs={12} sm={6} lg={3} key={i}>
                <KpiCard {...kpi} index={i} />
              </Grid>
            ))}
      </Grid>

      {/* Content Grid */}
      <Grid container spacing={3}>
        {/* Tasks Panel */}
        <Grid item xs={12} lg={8}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              minHeight: 400,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
              flexWrap="wrap"
              gap={2}
            >
              <Typography variant="h6" fontWeight={700} color="#4B49AC">
                My Tasks
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap">
                {["all", "today", "overdue", "completed"].map((filter) => (
                  <Chip
                    key={filter}
                    label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                    onClick={() => setActiveFilter(filter)}
                    sx={{
                      bgcolor: activeFilter === filter ? "#4B49AC" : "#E6E9FF",
                      color: activeFilter === filter ? "#fff" : "#4B49AC",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: activeFilter === filter ? "#4B49AC" : "#D0D5FF",
                      },
                      position: "relative",
                      "&::after":
                        activeFilter === filter
                          ? {
                              content: '""',
                              position: "absolute",
                              bottom: -4,
                              left: "50%",
                              transform: "translateX(-50%)",
                              width: "70%",
                              height: 3,
                              bgcolor: "#4B49AC",
                              borderRadius: 2,
                            }
                          : {},
                    }}
                  />
                ))}
              </Box>
            </Box>

            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} height={80} sx={{ mb: 1.5, borderRadius: 2 }} />
              ))
            ) : filteredTasks.length > 0 ? (
              filteredTasks.map((task, i) => <TaskRow key={task.id} task={task} index={i} />)
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={6}
              >
                <CheckCircle sx={{ fontSize: 64, color: "#4CAF50", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No tasks in this category
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  You're all caught up!
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Activity Timeline + Quick Actions */}
        <Grid item xs={12} lg={4}>
          {/* Quick Actions */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              mb: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#4B49AC" gutterBottom>
              Quick Actions
            </Typography>
            <Box display="flex" flexDirection="column" gap={1.5}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate("/employee/leave")}
                sx={{
                  bgcolor: "#4B49AC",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#3d3a8f" },
                }}
              >
                Request Leave
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/employee/policies")}
                sx={{
                  borderColor: "#7DA0FA",
                  color: "#7DA0FA",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#4B49AC", bgcolor: "#F8F9FF" },
                }}
              >
                View Policies
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate("/employee/attendance")}
                sx={{
                  borderColor: "#7DA0FA",
                  color: "#7DA0FA",
                  py: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#4B49AC", bgcolor: "#F8F9FF" },
                }}
              >
                View Attendance
              </Button>
            </Box>
          </Paper>

          {/* Activity Timeline */}
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <Typography variant="h6" fontWeight={700} color="#4B49AC" gutterBottom>
              Recent Activity
            </Typography>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} display="flex" gap={2} mb={2}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box flex={1}>
                    <Skeleton width="80%" />
                    <Skeleton width="40%" />
                  </Box>
                </Box>
              ))
            ) : (
              activities.map((activity, i) => (
                <ActivityItem key={activity.id} activity={activity} index={i} />
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
