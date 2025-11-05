// src/components/common/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Tooltip, Box } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";

/**
 * BackButton Component
 * 
 * A reusable back button that navigates to the previous page in history.
 * Should be placed at the top of pages (except landing pages after login).
 * 
 * Props:
 * - color: Button color (default: "primary")
 * - sx: Additional styles
 */
const BackButton = ({ color = "primary", sx = {} }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Navigate to previous page in history
  };

  return (
    <Box sx={{ mb: 2, ...sx }}>
      <Tooltip title="Go back to previous page">
        <IconButton
          onClick={handleBack}
          color={color}
          sx={{
            bgcolor: "rgba(75, 73, 172, 0.1)",
            "&:hover": {
              bgcolor: "rgba(75, 73, 172, 0.2)",
              transform: "translateX(-4px)",
            },
            transition: "all 0.2s ease",
            ...sx,
          }}
          aria-label="Go back"
        >
          <ArrowBack />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default BackButton;
