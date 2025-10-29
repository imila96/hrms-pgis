import React from "react";
import {
  Paper,
  Box,
  Avatar,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

// export default function ProfileSidebar({ user }) {
//   return (
//     <Paper sx={{ p: 3, bgcolor: "white" }}>
//       <Box
//         sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}
//       >
//         <Avatar
//           sx={{
//             width: 120,
//             height: 120,
//             mb: 2,
//             bgcolor: "#fde7e9",
//             color: "#222",
//           }}
//         >
//           {user?.name?.[0] ?? "U"}
//         </Avatar>
//         <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
//           {user?.name || "—"}
//         </Typography>
//         <Button variant="outlined" size="small" sx={{ borderRadius: 2, mb: 3 }}>
//           Edit Profile
//         </Button>

//         <Stack spacing={1.2} sx={{ width: "100%", color: "text.secondary" }}>
//           <Typography>{user?.jobTitle || "—"}</Typography>
//           <Typography>{user?.department || "—"}</Typography>
//           <Typography>{user?.email || "—"}</Typography>
//           <Typography>{user?.contact || "—"}</Typography>
//           <Typography>{`EMP${user?.id}`}</Typography>
//         </Stack>
//       </Box>
//     </Paper>
//   );
// }

export default function ProfileSidebar() {
  return (
    <Paper sx={{ p: 3, bgcolor: "white" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", flexDirection: "column" }}
      >
        <Avatar
          sx={{
            width: 120,
            height: 120,
            mb: 2,
            bgcolor: "#fde7e9",
            color: "#222",
          }}
        >
          OB
        </Avatar>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 1, textAlign: "center" }}
        >
          Employee Details
        </Typography>
        <Button variant="outlined" size="small" sx={{ borderRadius: 2, mb: 3 }}>
          Edit Profile
        </Button>

        <Stack spacing={1.2} sx={{ width: "100%", color: "text.secondary" }}>
          <Typography>Olivia Bennett</Typography>
          <Typography>Software Engineer</Typography>
          <Typography>Engineering</Typography>
          <Typography>olivia.bennett@example.com</Typography>
          <Typography>+1-555-123-4567</Typography>
          <Typography>EMP00123</Typography>
        </Stack>
      </Box>
    </Paper>
  );
}
