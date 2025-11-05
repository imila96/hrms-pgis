import React from "react";
import { Backdrop, Box, Typography } from "@mui/material";

const shimmer = {
  "@keyframes ring": {
    "0%": { transform: "rotate(0deg)" },
    "100%": { transform: "rotate(360deg)" },
  },
  "@keyframes pulse": {
    "0%, 100%": { transform: "scale(1)", opacity: 0.9 },
    "50%": { transform: "scale(1.08)", opacity: 1 },
  },
};

const RoleTransitionOverlay = ({ open, message, role }) => {
  const badge = role ? role.slice(0, 2).toUpperCase() : "GO";
  return (
    <Backdrop
      open={open}
      sx={{
        color: "#fff",
        zIndex: (theme) => theme.zIndex.drawer + 2000,
        backdropFilter: "blur(6px)",
        background:
          "linear-gradient(135deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.85))",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: 96,
            height: 96,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid rgba(255, 255, 255, 0.15)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 6,
              borderRadius: "50%",
              border: "3px solid rgba(255, 255, 255, 0.25)",
              borderTopColor: "#fff",
              animation: "ring 1.2s linear infinite",
              ...shimmer,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 18,
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              letterSpacing: 0.5,
              animation: "pulse 1.8s ease-in-out infinite",
              ...shimmer,
            }}
          >
            {badge}
          </Box>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {message || "Switching dashboard..."}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          Please hold on while we prepare your workspace.
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default RoleTransitionOverlay;
