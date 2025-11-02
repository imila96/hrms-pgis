// // src/components/HrDashboard/HrDashboard.js
// import React, { useState, useContext } from "react";
// import {
//   Box,
//   Drawer,
//   Toolbar,
//   Typography,
//   AppBar,
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Menu,
//   MenuItem,
//   Avatar,
//   Tooltip,
//   Badge,
//   useTheme,
// } from "@mui/material";
// import {
//   Brightness4,
//   Brightness7,
//   Notifications as NotificationsIcon,
// } from "@mui/icons-material";
// import { useNavigate, Routes, Route, NavLink } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// // Components
// import EmployeeRecords from "./EmployeeRecords";
// import LeaveManagement from "./LeaveManagement";
// import AttendanceTracking from "./AttendanceTracking";
// import RecruitmentManagement from "./RecruitmentManagement";
// import PolicyManagement from "./PolicyManagement";
// import Profile from "./Profile";
// import AnnouncementManagement from "./AnnouncementManagement";

// // Optional: theme context
// const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

// const drawerWidth = 240;

// const tabItems = [
//   { label: "Profile", path: "/hr/profile" },
//   { label: "Employee Records", path: "/hr/records" },
//   { label: "Leave Management", path: "/hr/leave" },
//   { label: "Attendance Tracking", path: "/hr/attendance" },
//   { label: "Recruitment", path: "/hr/recruitment" },
//   { label: "Policies", path: "/hr/policies" },
//   { label: "Announcements", path: "/hr/announcements" },
// ];

// const HrDashboard = () => {
//   const { logout, user, setActiveRole } = useAuth();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const colorMode = useContext(ColorModeContext);

//   const [anchorEl, setAnchorEl] = useState(null);
//   const open = Boolean(anchorEl);

//   const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
//   const handleMenuClose = () => setAnchorEl(null);

//   const handleLogout = () => {
//     handleMenuClose();
//     logout();
//     navigate("/");
//   };

//   const handleProfile = () => {
//     handleMenuClose();
//     navigate("/hr/profile");
//   };

//   const getInitials = (nameOrEmail) => {
//     if (!nameOrEmail) return "U";
//     const parts = nameOrEmail.split(" ");
//     if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
//     return (parts[0][0] + parts[1][0]).toUpperCase();
//   };

//   const goToRoleHome = (r) => {
//     const map = {
//       admin: "/admin/profile",
//       hr: "/hr/profile",
//       director: "/director/profile",
//       employee: "/employee/profile",
//     };
//     return map[r] || "/";
//   };

//   const switchTo = (role) => {
//     setActiveRole(role);
//     handleMenuClose();
//     setTimeout(() => navigate(goToRoleHome(role)), 0);
//   };

//   return (
//     <Box sx={{ display: "flex" }}>
//       <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
//         <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
//           <Typography variant="h6" noWrap>
//             HR Dashboard
//           </Typography>

//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             {/* Theme Toggle */}
//             <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
//               {theme.palette.mode === "dark" ? <Brightness7 /> : <Brightness4 />}
//             </IconButton>

//             {/* Notifications */}
//             <IconButton color="inherit">
//               <Badge badgeContent={2} color="error">
//                 <NotificationsIcon />
//               </Badge>
//             </IconButton>

//             {/* Avatar */}
//             <Tooltip title="Account settings">
//               <IconButton color="inherit" onClick={handleMenuOpen}>
//                 {user?.photoURL ? (
//                   <Avatar src={user.photoURL} />
//                 ) : (
//                   <Avatar>
//                     {getInitials(user?.name || user?.email) || (
//                       <AccountCircleIcon />
//                     )}
//                   </Avatar>
//                 )}
//               </IconButton>
//             </Tooltip>

//             <Menu
//               anchorEl={anchorEl}
//               open={open}
//               onClose={handleMenuClose}
//               anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
//               transformOrigin={{ vertical: "top", horizontal: "right" }}
//             >
//               <MenuItem onClick={handleProfile}>Profile</MenuItem>

//               {/* Role switcher */}
//               <MenuItem disabled>
//                 Active: {(user?.activeRole || "").toUpperCase()}
//               </MenuItem>
//               {user?.roles
//                 ?.filter((r) => r !== user?.activeRole)
//                 .map((r) => (
//                   <MenuItem key={r} onClick={() => switchTo(r)}>
//                     Switch to {r.charAt(0).toUpperCase() + r.slice(1)} view
//                   </MenuItem>
//                 ))}

//               <MenuItem onClick={handleLogout}>Logout</MenuItem>
//             </Menu>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       {/* Sidebar Drawer */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           width: drawerWidth,
//           flexShrink: 0,
//           [`& .MuiDrawer-paper`]: {
//             width: drawerWidth,
//             boxSizing: "border-box",
//           },
//         }}
//       >
//         <Toolbar />
//         <Box sx={{ overflow: "auto" }}>
//           <List>
//             {tabItems.map(({ label, path }) => (
//               <ListItem
//                 button
//                 key={path}
//                 component={NavLink}
//                 to={path}
//                 sx={{ "&.active": { backgroundColor: "#e0e0e0" } }}
//               >
//                 <ListItemText primary={label} />
//               </ListItem>
//             ))}
//           </List>
//         </Box>
//       </Drawer>

//       {/* Main Content */}
//       <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
//         <Toolbar />
//         <Routes>
//           <Route path="profile" element={<Profile />} />
//           <Route path="records" element={<EmployeeRecords />} />
//           <Route path="leave" element={<LeaveManagement />} />
//           <Route path="attendance" element={<AttendanceTracking />} />
//           <Route path="recruitment" element={<RecruitmentManagement />} />
//           <Route path="policies" element={<PolicyManagement />} />
//           <Route path="announcements" element={<AnnouncementManagement />} />
//         </Routes>
//       </Box>
//     </Box>
//   );
// };

// export default HrDashboard;
// src/components/HrDashboard/HrDashboard.js
// src/components/HrDashboard/HrDashboard.js

// src/components/HrDashboard/HrDashboard.js
// src/components/HrDashboard/HrDashboard.js
// src/components/HrDashboard/HrDashboard.js
import React, { useState, useContext } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  Brightness4,
  Brightness7,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Components
import EmployeeRecords from "./EmployeeRecords";
import LeaveManagement from "./LeaveManagement";
import AttendanceTracking from "./AttendanceTracking";
import RecruitmentManagement from "./RecruitmentManagement";
import PolicyManagement from "./PolicyManagement";
import AnnouncementManagement from "./AnnouncementManagement";
import Profile from "../Profile/Profile";
// import Profile from "../HrDashboard/Profile";

// Theme context
const ColorModeContext = React.createContext({ toggleColorMode: () => {} });

const tabItems = [
  { label: "Employee Records", path: "/hr/records" },
  { label: "Leave", path: "/hr/leave" },
  { label: "Attendance", path: "/hr/attendance" },
  { label: "Recruitment", path: "/hr/recruitment" },
  { label: "Policies", path: "/hr/policies" },
  { label: "Announcements", path: "/hr/announcements" },
];

const HrDashboard = () => {
  const { logout, user, setActiveRole } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/");
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/hr/profile");
  };

  const getInitials = (nameOrEmail) => {
    if (!nameOrEmail) return "U";
    const parts = nameOrEmail.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const goToRoleHome = (r) => {
    const map = {
      admin: "/admin/profile",
      hr: "/hr/profile",
      director: "/director/profile",
      employee: "/employee/profile",
    };
    return map[r] || "/";
  };

  const switchTo = (role) => {
    setActiveRole(role);
    handleMenuClose();
    setTimeout(() => navigate(goToRoleHome(role)), 0);
  };

  // Custom theme using your color palette
  const customTheme = createTheme({
    palette: {
      primary: {
        main: "#4B49AC",
      },
      secondary: {
        main: "#98BDFF",
      },
      info: {
        main: "#7DA0FA",
      },
      success: {
        main: "#7978E9",
      },
      error: {
        main: "#F3797E",
      },
      background: {
        default: "#acaeb8ff",
      },
    },
    typography: {
      fontFamily: "'Poppins', sans-serif",
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          backgroundColor: "#f0f1f5ff",
        }}
      >
        {/* Header AppBar */}
        <AppBar
          position="fixed"
          elevation={3}
          sx={{
            backgroundColor: "#4B49AC",
            color: "#FFFFFF",
          }}
        >
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Left: Title clickable */}
            <Typography
              variant="h6"
              noWrap
              sx={{
                cursor: "pointer",
                fontWeight: 700,
                "&:hover": { color: "#98BDFF", transform: "scale(1.05)" },
                transition: "all 0.3s ease",
              }}
              onClick={() => navigate("/hr")}
            >
              HR Dashboard
            </Typography>

            {/* Center: Tabs */}
            <Box sx={{ display: "flex", gap: 2 }}>
              {tabItems.map(({ label, path }) => (
                <Button
                  key={path}
                  component={NavLink}
                  to={path}
                  color="inherit"
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#E6E9FF",
                    borderRadius: "8px",
                    px: 2,
                    "&.active": {
                      backgroundColor: "#F3797E",
                      color: "#fff",
                    },
                    "&:hover": {
                      backgroundColor: "#7DA0FA",
                      color: "#fff",
                      transform: "scale(1.05)",
                      transition: "all 0.3s ease",
                    },
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>

            {/* Right: Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Theme toggle */}
              <IconButton
                sx={{
                  color: "#E6E9FF",
                  "&:hover": { color: "#98BDFF", transform: "scale(1.1)" },
                  transition: "0.2s",
                }}
                onClick={colorMode.toggleColorMode}
              >
                {theme.palette.mode === "dark" ? (
                  <Brightness7 />
                ) : (
                  <Brightness4 />
                )}
              </IconButton>

              {/* Notifications */}
              <IconButton
                sx={{
                  color: "#E6E9FF",
                  "&:hover": { color: "#F3797E", transform: "scale(1.1)" },
                  transition: "0.2s",
                }}
              >
                <Badge badgeContent={2} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              {/* Avatar Menu */}
              <Tooltip title="Account settings">
                <IconButton
                  sx={{
                    "&:hover": { transform: "scale(1.1)" },
                    transition: "0.2s",
                  }}
                  onClick={handleMenuOpen}
                >
                  {user?.photoURL ? (
                    <Avatar src={user.photoURL} />
                  ) : (
                    <Avatar sx={{ bgcolor: "#98BDFF" }}>
                      {getInitials(user?.name || user?.email) || (
                        <AccountCircleIcon />
                      )}
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem onClick={handleProfile}>Profile</MenuItem>
                <MenuItem disabled>
                  Active: {(user?.activeRole || "").toUpperCase()}
                </MenuItem>
                {user?.roles
                  ?.filter((r) => r !== user?.activeRole)
                  .map((r) => (
                    <MenuItem key={r} onClick={() => switchTo(r)}>
                      Switch to {r.charAt(0).toUpperCase() + r.slice(1)} view
                    </MenuItem>
                  ))}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box
          component="main"
          sx={{ flexGrow: 1, p: 3, mt: 10, backgroundColor: "#f0f1f5ff" }}
        >
          <Routes>
            {/* Dashboard Home */}
            <Route
              index
              element={
                <Box sx={{ py: 3 }}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    Welcome back, {user?.name || "HR User"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Department: HR • Employee ID: {user?.employeeId || "EMP001"}
                  </Typography>

                  {/* Overview Cards */}
                  <Grid container spacing={2} sx={{ my: 3 }}>
                    {[
                      {
                        title: "Total Staff",
                        value: "247",
                        subtitle: "Active employees across departments",
                      },
                      {
                        title: "Attendance Rate",
                        value: "94.2%",
                        subtitle: "Company-wide average for current month",
                      },
                      {
                        title: "Open Positions",
                        value: "18",
                        subtitle: "Current vacancies across departments",
                      },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={4} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            transition: "0.3s",
                            "&:hover": {
                              boxShadow: "0px 4px 12px rgba(73, 105, 200, 0.2)",
                              transform: "translateY(-3px)",
                            },
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {item.title}
                          </Typography>
                          <Typography
                            variant="h5"
                            fontWeight={700}
                            color="#4B49AC"
                          >
                            {item.value}
                          </Typography>
                          <Typography variant="body2">
                            {item.subtitle}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Quick Access Cards */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    color="#4B49AC"
                  >
                    Staff Dashboard
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 4 }}>
                    {[
                      { title: "Employee Records", path: "/hr/records" },
                      { title: "Leave Management", path: "/hr/leave" },
                      { title: "Recruitment", path: "/hr/recruitment" },
                      { title: "Policies", path: "/hr/policies" },
                    ].map((item, idx) => (
                      <Grid item xs={12} md={3} key={idx}>
                        <Paper
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            textAlign: "center",
                            transition: "0.3s",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                              transform: "scale(1.03)",
                            },
                          }}
                        >
                          <Typography fontWeight={600}>{item.title}</Typography>
                          <Button
                            size="small"
                            sx={{
                              mt: 2,
                              backgroundColor: "#7DA0FA",
                              color: "#fff",
                              "&:hover": {
                                backgroundColor: "#4B49AC",
                              },
                            }}
                            variant="contained"
                            onClick={() => navigate(item.path)}
                          >
                            Open
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Grid container spacing={3}>
                    {/* Notifications */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                        color="#4B49AC"
                      >
                        Notifications
                      </Typography>
                      <Paper sx={{ p: 2, borderRadius: 3 }}>
                        <List dense>
                          {[
                            "Leave Request Pending - 3 requests awaiting approval",
                            "Upcoming Interviews - 3 interviews tomorrow",
                            "Complaint Requiring Attention - Workplace issue filed",
                            "Policy Approval Required - Review pending",
                          ].map((text, idx) => (
                            <ListItem key={idx}>
                              <ListItemIcon>
                                <NotificationsNoneIcon
                                  color="info"
                                  fontSize="small"
                                />
                              </ListItemIcon>
                              <ListItemText primary={text} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </Grid>

                    {/* Stats */}
                    <Grid item xs={12} md={6}>
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                        color="#4B49AC"
                      >
                        Your Stats
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Leave Balance
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color="#4B49AC"
                            >
                              12 Days
                            </Typography>
                            <Typography variant="body2">
                              Annual leave remaining
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Paper sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Attendance Rate
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color="#4B49AC"
                            >
                              98%
                            </Typography>
                            <Typography variant="body2">
                              Your attendance this month
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={12}>
                          <Paper sx={{ p: 2, borderRadius: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                              Pending
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color="#4B49AC"
                            >
                              3 Tasks
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{
                                mt: 1,
                                color: "#4B49AC",
                                borderColor: "#4B49AC",
                                "&:hover": {
                                  backgroundColor: "#98BDFF",
                                  color: "#fff",
                                },
                              }}
                            >
                              View Tasks
                            </Button>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Announcements */}
                  <Box sx={{ mt: 4 }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      gutterBottom
                      color="#4B49AC"
                    >
                      Upcoming Announcements
                    </Typography>
                    <Paper sx={{ p: 2, borderRadius: 3 }}>
                      <List>
                        {[
                          {
                            text: "Office Renovation - Nov 12th, Floor 3 closed",
                          },
                          { text: "New Benefits Package - Starting Dec 1st" },
                          { text: "Company Town Hall - Nov 25th, 3:00 PM" },
                        ].map((item, idx) => (
                          <ListItem key={idx}>
                            <ListItemIcon>
                              <EventNoteIcon
                                color="secondary"
                                fontSize="small"
                              />
                            </ListItemIcon>
                            <ListItemText primary={item.text} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                </Box>
              }
            />
            <Route path="profile" element={<Profile />} />
            <Route path="records" element={<EmployeeRecords />} />
            <Route path="leave" element={<LeaveManagement />} />
            <Route path="attendance" element={<AttendanceTracking />} />
            <Route path="recruitment" element={<RecruitmentManagement />} />
            <Route path="policies" element={<PolicyManagement />} />
            <Route path="announcements" element={<AnnouncementManagement />} />
          </Routes>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default HrDashboard;
