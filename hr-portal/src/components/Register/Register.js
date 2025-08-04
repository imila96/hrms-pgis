// src/components/Register.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff, Email } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const isStrongPassword = (password) =>
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(password);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) return setError("Invalid email format.");
    if (!isStrongPassword(form.password)) return setError("Weak password.");
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.");

    // TODO: Send data to backend
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) navigate("/");
      else setError("Registration failed.");
    } catch (err) {
      setError("Server error. Try again later.");
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#f5f5f5", p: 2 }}>
      <Box sx={{ width: 400, p: 4, bgcolor: "white", borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h4" fontWeight="bold" mb={2}>Register</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" name="email" value={form.email} onChange={handleChange} margin="normal"
            InputProps={{
              endAdornment: <InputAdornment position="end"><Email /></InputAdornment>,
            }} required />
          <TextField fullWidth label="Password" name="password" type={showPassword ? "text" : "password"} value={form.password}
            onChange={handleChange} margin="normal"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)}>{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                </InputAdornment>
              ),
            }} required />
          <TextField fullWidth label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword}
            onChange={handleChange} margin="normal" required />
          {error && <Typography color="error" variant="body2" mt={1}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2, fontWeight: "bold" }}>
            Register
          </Button>
          <Typography mt={2} variant="body2" color="text.secondary">
            Already have an account? <Link href="/" underline="hover">Login</Link>
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default Register;
