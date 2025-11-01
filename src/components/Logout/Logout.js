import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Box, CircularProgress, Typography } from "@mui/material";

const Logout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Logging out...");

  useEffect(() => {
    const performLogout = async () => {
      try {
        await logout();
        setMessage("Logged out successfully");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } catch (error) {
        console.error("Logout error:", error);
        setMessage("Logout complete");
        setTimeout(() => {
          navigate("/");
        }, 1000);
      }
    };

    performLogout();
  }, [logout, navigate]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
      }}
    >
      <CircularProgress size={60} sx={{ mb: 3 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
};

export default Logout;
