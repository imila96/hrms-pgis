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
import axiosInstance from "../../AxiosInstance";

// ============ Presentational Components ============

const KpiCard = ({ title, value, subtitle, icon: Icon, color, index }) => {
  const [count, setCount] = useState(0);
  const targetValue = parseInt(value) || 0;

  useEffect(() => {
    if (typeof targetValue !== "number") return;
    let start = 0;
    const duration = 800;
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
        p: 2,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`,
        boxShadow: `0 4px 20px ${color}20`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
        position: 'relative',
        overflow: 'hidden',
        "@keyframes fadeInUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
        "&:hover": {
          transform: "translateY(-6px) scale(1.03)",
          boxShadow: `0 12px 32px ${color}30`,
          '&::before': {
            transform: 'translateX(100%)',
          },
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: `linear-gradient(90deg, transparent, ${color}20, transparent)`,
          transition: 'transform 0.6s',
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            bgcolor: color || "#667eea",
            width: 48,
            height: 48,
            boxShadow: `0 4px 16px ${color}40`,
          }}
        >
          <Icon sx={{ fontSize: 24 }} />
        </Avatar>
        <Box flex={1}>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={700} sx={{ 
            background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.2,
          }}>
            {typeof targetValue === "number" ? count : value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
            {subtitle}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

const LeaveRow = ({ leave, index }) => {
  const priorityColor = {
    high: "#F3797E",
    medium: "#FFA726",
    low: "#43e97b",
  };

  const StatusIcon =
    leave.statusLabel === "APPROVED"
      ? CheckCircle
      : leave.statusLabel === "REJECTED"
      ? Warning
      : RadioButtonUnchecked;

  const statusColor = 
    leave.statusLabel === "APPROVED"
      ? "#43e97b"
      : leave.statusLabel === "REJECTED"
      ? "#F3797E"
      : "#FFA726";

  return (
    <Paper
      sx={{
        p: 1.5,
        mb: 1,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${statusColor}08 0%, ${statusColor}03 100%)`,
        borderLeft: `3px solid ${statusColor}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: `slideIn 0.4s ease-out ${index * 0.05}s both`,
        "@keyframes slideIn": {
          from: { opacity: 0, transform: "translateX(-10px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },
        "@media (prefers-reduced-motion: reduce)": {
          animation: "none",
        },
        "&:hover": {
          background: `linear-gradient(135deg, ${statusColor}15 0%, ${statusColor}08 100%)`,
          boxShadow: `0 4px 16px ${statusColor}20`,
          transform: "translateX(6px)",
          cursor: "pointer",
        },
      }}
    >
      <Box display="flex" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            bgcolor: `${statusColor}20`,
            width: 36,
            height: 36,
            border: `2px solid ${statusColor}`,
          }}
        >
          <StatusIcon sx={{ color: statusColor, fontSize: 20 }} />
        </Avatar>
        <Box flex={1} minWidth={0}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{
              color: "text.primary",
              fontSize: '0.85rem',
              mb: 0.3,
            }}
            noWrap
          >
            {leave.title}
          </Typography>
          {leave.subtitle && (
            <Typography 
              variant="caption" 
              color="text.secondary" 
              display="block" 
              sx={{ fontSize: '0.7rem', mb: 0.5 }}
              noWrap
            >
              {leave.subtitle}
            </Typography>
          )}
          <Box display="flex" gap={0.5} alignItems="center" flexWrap="wrap">
            <Chip
              label={leave.statusLabel}
              size="small"
              sx={{
                bgcolor: statusColor,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.65rem",
                height: 20,
              }}
            />
            <Chip
              label={leave.dateRange}
              size="small"
              variant="outlined"
              sx={{ 
                fontSize: "0.65rem", 
                height: 20,
                borderColor: `${statusColor}60`,
                color: statusColor,
              }}
            />
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

const SkeletonCard = () => (
  <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid #e0e0e0' }}>
    <Box display="flex" gap={1.5}>
      <Skeleton variant="circular" width={48} height={48} />
      <Box flex={1}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={28} sx={{ my: 0.5 }} />
        <Skeleton width="80%" height={14} />
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
  const [employeeName, setEmployeeName] = useState("");
  const [dashboardData, setDashboardData] = useState({
    leaveBalance: [],
    myLeaves: [],
    attendanceState: null,
    attendanceData: [],
    announcements: [],
    policies: [],
  });

  // Fetch all employee dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch employee name
        const employeeRes = await axiosInstance.get("/hr/employees/me");
        setEmployeeName(employeeRes.data.name || "");

        // Fetch leave balance for current year
        const currentYear = new Date().getFullYear();
        const leaveBalanceRes = await axiosInstance.get(`/leave/balance?year=${currentYear}`);
        
        // Fetch my leaves
        const myLeavesRes = await axiosInstance.get("/leave/my");
        
        // Fetch attendance state for today
        const attendanceStateRes = await axiosInstance.get("/attendance/me/state");
        
        // Fetch current month's attendance
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
        const attendanceRes = await axiosInstance.get(`/attendance/me?month=${currentMonth}`);

        // Fetch recent announcements
        const announcementsRes = await axiosInstance.get("/announcements").catch(() => ({ data: [] }));
        
        // Fetch policies
        const policiesRes = await axiosInstance.get("/policies").catch(() => ({ data: [] }));

        setDashboardData({
          leaveBalance: leaveBalanceRes.data || [],
          myLeaves: myLeavesRes.data || [],
          attendanceState: attendanceStateRes.data || null,
          attendanceData: attendanceRes.data || [],
          announcements: (announcementsRes.data || []).slice(0, 3), // Latest 3
          policies: (policiesRes.data || []).slice(0, 3), // Latest 3
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Calculate KPIs from real data
  const totalLeaveBalance = dashboardData.leaveBalance.reduce((sum, lb) => sum + (lb.remaining || 0), 0);
  const pendingLeaves = dashboardData.myLeaves.filter(l => l.status === "PENDING").length;
  const approvedLeaves = dashboardData.myLeaves.filter(l => l.status === "APPROVED").length;
  
  // Calculate attendance rate for current month
  const presentDays = dashboardData.attendanceData.filter(d => d.status === "PRESENT").length;
  const totalDays = dashboardData.attendanceData.length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const kpis = [
    {
      title: "Total Leave Balance",
      value: totalLeaveBalance.toString(),
      subtitle: "Days available this year",
      icon: EventAvailable,
      color: "#7978E9",
    },
    {
      title: "Pending Leave Requests",
      value: pendingLeaves.toString(),
      subtitle: "Awaiting approval",
      icon: Schedule,
      color: "#7DA0FA",
    },
    {
      title: "Approved Leaves",
      value: approvedLeaves.toString(),
      subtitle: "Upcoming approved leaves",
      icon: AssignmentTurnedIn,
      color: "#4B49AC",
    },
    {
      title: "This Month",
      value: `${attendanceRate}%`,
      subtitle: "Attendance rate",
      icon: TrendingUp,
      color: "#4CAF50",
    },
  ];

  // Transform leaves into task-like items for display
  const leaveItems = dashboardData.myLeaves.slice(0, 10).map((leave) => {
    const getStatusInfo = (status) => {
      switch (status) {
        case "APPROVED":
          return { status: "completed", priority: "low", icon: CheckCircle };
        case "PENDING":
          return { status: "pending", priority: "medium", icon: RadioButtonUnchecked };
        case "REJECTED":
          return { status: "overdue", priority: "high", icon: Warning };
        default:
          return { status: "pending", priority: "low", icon: RadioButtonUnchecked };
      }
    };

    const statusInfo = getStatusInfo(leave.status);
    // Backend returns 'start' and 'end', not 'startDate' and 'endDate'
    const startDate = new Date(leave.start);
    const endDate = new Date(leave.end);
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

    // Backend returns 'type' (enum), not 'leaveType' (string)
    const leaveTypeDisplay = leave.type ? String(leave.type).replace(/_/g, ' ') : 'Leave';

    return {
      id: leave.id, // Backend uses 'id', not 'leaveId'
      title: `${leaveTypeDisplay} - ${days} day${days > 1 ? 's' : ''}`,
      subtitle: leave.reason || "No reason provided",
      priority: statusInfo.priority,
      dueDate: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      status: statusInfo.status,
      statusLabel: leave.status,
      dateRange: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    };
  });

  const filteredLeaves = leaveItems.filter((item) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "pending") return item.statusLabel === "PENDING";
    if (activeFilter === "approved") return item.statusLabel === "APPROVED";
    if (activeFilter === "rejected") return item.statusLabel === "REJECTED";
    return true;
  });

  return (
    <Box sx={{ 
      height: 'calc(100vh - 100px)', 
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      p: 2,
    }}>
      {/* Compact Header with Gradient and Animation */}
      <Box
        sx={{
          mb: 2,
          p: 2.5,
          borderRadius: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          color: "#fff",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
            animation: 'shine 3s infinite',
          },
          '@keyframes shine': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' },
          },
        }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ 
          background: 'linear-gradient(to right, #fff, #f0f0ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 0.5,
        }}>
          Welcome back, {employeeName || user?.email?.split("@")[0] || "Employee"}! 👋
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 500 }}>
          Here's your activity overview for today
        </Typography>
      </Box>

      {/* Compact KPI Cards - Single Row */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Grid container spacing={2}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <SkeletonCard />
                </Grid>
              ))
            : kpis.map((kpi, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <KpiCard {...kpi} index={i} />
                </Grid>
              ))}
        </Grid>
      </Box>

      {/* Main Content Grid - Optimized Height */}
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* My Leave Requests - 60% Width */}
          <Grid item xs={12} lg={7} sx={{ height: '100%' }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                background: 'linear-gradient(to bottom, #ffffff, #fafbff)',
                border: '1px solid #e6e9ff',
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="h6" fontWeight={700} sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  📋 My Leave Requests
                </Typography>
                <Box display="flex" gap={0.5} flexWrap="wrap">
                  {["all", "pending", "approved", "rejected"].map((filter) => (
                    <Chip
                      key={filter}
                      label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                      onClick={() => setActiveFilter(filter)}
                      size="small"
                      sx={{
                        bgcolor: activeFilter === filter ? "#667eea" : "#f0f2ff",
                        color: activeFilter === filter ? "#fff" : "#667eea",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        height: 28,
                        fontSize: '0.75rem',
                        "&:hover": {
                          bgcolor: activeFilter === filter ? "#5568d3" : "#e0e4ff",
                          transform: "translateY(-2px)",
                          boxShadow: "0 4px 8px rgba(102, 126, 234, 0.2)",
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ 
                flex: 1, 
                overflow: 'auto', 
                pr: 1,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '10px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#667eea',
                  borderRadius: '10px',
                  '&:hover': {
                    background: '#5568d3',
                  },
                },
              }}>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} height={70} sx={{ mb: 1, borderRadius: 2 }} />
                  ))
                ) : filteredLeaves.length > 0 ? (
                  filteredLeaves.map((leave, i) => <LeaveRow key={leave.id} leave={leave} index={i} />)
                ) : (
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                  >
                    <CheckCircle sx={{ fontSize: 56, color: "#4CAF50", mb: 1.5, opacity: 0.7 }} />
                    <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                      No leave requests in this category
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeFilter === "all" 
                        ? "You haven't submitted any leave requests yet" 
                        : `No ${activeFilter} leave requests found`}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Right Sidebar - 40% Width */}
          <Grid item xs={12} lg={5} sx={{ height: '100%' }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2, 
              height: '100%',
            }}>
              {/* Quick Actions - Compact */}
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 3,
                  boxShadow: "0 4px 20px rgba(118, 75, 162, 0.15)",
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ fontSize: '1rem' }}>
                  ⚡ Quick Actions
                </Typography>
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/employee/leave")}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      "&:hover": { 
                        bgcolor: "rgba(255,255,255,0.35)",
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    Request Leave
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/employee/policies")}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      "&:hover": { 
                        bgcolor: "rgba(255,255,255,0.35)",
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    View Policies
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={() => navigate("/employee/attendance")}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.25)",
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      "&:hover": { 
                        bgcolor: "rgba(255,255,255,0.35)",
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                      },
                    }}
                  >
                    Attendance
                  </Button>
                </Box>
              </Paper>

              {/* Two Column Layout for Holidays & Leave Balance */}
              <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
                {/* Upcoming Holidays */}
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: "0 4px 20px rgba(240, 147, 251, 0.15)",
                    background: 'linear-gradient(to bottom, #ffffff, #fff5fd)',
                    border: '1px solid #ffe6f9',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1.5,
                    fontSize: '0.95rem',
                  }}>
                    🇱🇰 Upcoming Holidays
                  </Typography>
                  <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#f093fb',
                      borderRadius: '10px',
                    },
                  }}>
                    {getSriLankanHolidays().slice(0, 4).map((holiday, i) => (
                      <Box
                        key={i}
                        sx={{
                          mb: 1,
                          p: 1.5,
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #ffeaf6 0%, #fff5fd 100%)',
                          borderLeft: "3px solid #f093fb",
                          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            background: 'linear-gradient(135deg, #ffd9f0 0%, #ffeaf6 100%)',
                            transform: "translateX(4px)",
                            boxShadow: "0 4px 12px rgba(240, 147, 251, 0.3)",
                          },
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} color="#c2185b" sx={{ fontSize: '0.8rem' }} noWrap>
                          {holiday.name}
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={0.5}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {holiday.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </Typography>
                          <Chip
                            label={`${holiday.daysUntil}d`}
                            size="small"
                            sx={{
                              bgcolor: holiday.daysUntil <= 7 ? "#f5576c22" : "#f093fb22",
                              color: holiday.daysUntil <= 7 ? "#f5576c" : "#f093fb",
                              fontWeight: 700,
                              fontSize: "0.65rem",
                              height: 18,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Leave Balance */}
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                    background: 'linear-gradient(to bottom, #ffffff, #f0f2ff)',
                    border: '1px solid #e0e4ff',
                  }}
                >
                  <Typography variant="subtitle1" fontWeight={700} sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1.5,
                    fontSize: '0.95rem',
                  }}>
                    💼 Leave Balance
                  </Typography>
                  <Box sx={{ 
                    flex: 1, 
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '10px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#667eea',
                      borderRadius: '10px',
                    },
                  }}>
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Box key={i} mb={1.5}>
                          <Skeleton width="70%" height={18} />
                          <Skeleton width="50%" height={14} />
                        </Box>
                      ))
                    ) : dashboardData.leaveBalance.length > 0 ? (
                      dashboardData.leaveBalance.map((lb, i) => {
                        const leaveTypeDisplay = lb.type ? String(lb.type).replace(/_/g, ' ') : 'Leave';
                        const percentage = lb.entitled ? Math.round(((lb.remaining || 0) / lb.entitled) * 100) : 0;
                        const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b'];
                        const color = colors[i % colors.length];
                        
                        return (
                          <Box
                            key={i}
                            sx={{
                              mb: 1.5,
                              p: 1.5,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`,
                              border: `1px solid ${color}30`,
                              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                              "&:hover": {
                                background: `linear-gradient(135deg, ${color}25 0%, ${color}15 100%)`,
                                transform: "translateY(-2px)",
                                boxShadow: `0 6px 16px ${color}30`,
                              },
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                              <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem' }}>
                                {leaveTypeDisplay}
                              </Typography>
                              <Chip
                                label={`${lb.remaining || 0}`}
                                size="small"
                                sx={{
                                  bgcolor: color,
                                  color: "#fff",
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                  height: 22,
                                  minWidth: 40,
                                }}
                              />
                            </Box>
                            <Box sx={{ 
                              width: '100%', 
                              height: 6, 
                              bgcolor: `${color}20`, 
                              borderRadius: 3,
                              overflow: 'hidden',
                              mb: 0.5,
                            }}>
                              <Box sx={{
                                width: `${percentage}%`,
                                height: '100%',
                                bgcolor: color,
                                borderRadius: 3,
                                transition: 'width 1s ease',
                              }} />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                              Total: {lb.entitled || 0} • Used: {lb.taken || 0} • {percentage}% remaining
                            </Typography>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', textAlign: 'center', mt: 2 }}>
                        No leave balance information available
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// Helper function to get Sri Lankan public holidays
function getSriLankanHolidays() {
  const today = new Date();
  
  // Sri Lankan Public Holidays for 2025 (including religious and national holidays)
  const holidays = [
    { name: "Duruthu Full Moon Poya Day", date: new Date(2025, 0, 13) },
    { name: "Thai Pongal", date: new Date(2025, 0, 14) },
    { name: "Independence Day", date: new Date(2025, 1, 4) },
    { name: "Navam Full Moon Poya Day", date: new Date(2025, 1, 12) },
    { name: "Maha Shivarathri Day", date: new Date(2025, 1, 26) },
    { name: "Madin Full Moon Poya Day", date: new Date(2025, 2, 14) },
    { name: "Good Friday", date: new Date(2025, 3, 18) },
    { name: "Sinhala & Tamil New Year", date: new Date(2025, 3, 14) },
    { name: "Bak Full Moon Poya Day", date: new Date(2025, 3, 12) },
    { name: "May Day", date: new Date(2025, 4, 1) },
    { name: "Vesak Full Moon Poya Day", date: new Date(2025, 4, 12) },
    { name: "Day Following Vesak", date: new Date(2025, 4, 13) },
    { name: "Poson Full Moon Poya Day", date: new Date(2025, 5, 11) },
    { name: "Eid al-Adha", date: new Date(2025, 5, 7) },
    { name: "Esala Full Moon Poya Day", date: new Date(2025, 6, 10) },
    { name: "Nikini Full Moon Poya Day", date: new Date(2025, 7, 9) },
    { name: "Milad-un-Nabi", date: new Date(2025, 8, 5) },
    { name: "Binara Full Moon Poya Day", date: new Date(2025, 8, 7) },
    { name: "Vap Full Moon Poya Day", date: new Date(2025, 9, 6) },
    { name: "Deepavali", date: new Date(2025, 9, 20) },
    { name: "Il Full Moon Poya Day", date: new Date(2025, 10, 5) },
    { name: "Unduvap Full Moon Poya Day", date: new Date(2025, 11, 5) },
    { name: "Christmas Day", date: new Date(2025, 11, 25) },
  ];

  // Filter upcoming holidays and calculate days until
  const upcomingHolidays = holidays
    .filter(h => h.date >= today)
    .map(h => ({
      ...h,
      daysUntil: Math.ceil((h.date - today) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.date - b.date);

  return upcomingHolidays.length > 0 ? upcomingHolidays : holidays.slice(0, 4).map(h => ({
    ...h,
    daysUntil: 0
  }));
}
