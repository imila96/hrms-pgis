// src/components/ForgetPassword.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import { Email } from "@mui/icons-material";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Invalid email address.");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSubmitted(true);
        setError("");
      } else {
        setError("Failed to send reset instructions.");
      }
    } catch {
      setError("Server error. Try again.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f5", p: 2 }}>
      <Box sx={{ width: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight="bold" mb={2}>Forgot Password</Typography>
        {submitted ? (
          <Typography variant="body1" color="success.main">Check your email for reset instructions.</Typography>
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal"
              InputProps={{
                endAdornment: <InputAdornment position="end"><Email /></InputAdornment>,
              }} required />
            {error && <Typography color="error" variant="body2" mt={1}>{error}</Typography>}
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: "bold" }}>
              Send Reset Link
            </Button>
          </form>
        )}
      </Box>
    </Box>
  );
};

export default ForgetPassword;
