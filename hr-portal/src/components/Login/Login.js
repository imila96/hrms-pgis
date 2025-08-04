// src/components/Login/Login.js
import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
} from "@mui/material";
import { Visibility, VisibilityOff, Email } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8080/auth/login", {
        email: form.email,
        password: form.password,
      });

      const { accessToken, roles } = response.data;

      // Store accessToken locally
      localStorage.setItem("token", accessToken);
      // setUser({ role: roles[0].toLowerCase().replace("role_", "") });
      setUser({ role: "hr" });

      setError("");

      // Redirect based on role
      if (roles.includes("ROLE_ADMIN")) {
        navigate("/admin/users");
      } else if (roles.includes("ROLE_HR")) {
        navigate("/hr/employee-records");
      } else if (roles.includes("ROLE_EMPLOYEE")) {
        navigate("/hr/employee-records");
      } else {
        setError("Something went wrong! Please try again later");
      }
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Box
        sx={{
          width: 360,
          p: 4,
          bgcolor: "white",
          borderRadius: 2,
          boxShadow: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" mb={1}>
          Welcome to the HR Portal
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Sign in to access your dashboard
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Email/Username"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email or username"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Email />
                </InputAdornment>
              ),
            }}
            required
          />
          <TextField
            fullWidth
            margin="normal"
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    size="small"
                    aria-label="toggle password visibility"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            align="left"
            mb={2}
          >
            Password must contain at least 8 characters with uppercase,
            lowercase, numbers, and special characters
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={() => setRememberMe((prev) => !prev)}
                color="primary"
              />
            }
            label="Remember Me"
            sx={{ mb: 2 }}
          />
          {error && (
            <Typography color="error" variant="body2" mb={2}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 1, fontWeight: "bold", fontSize: 16 }}
          >
            Sign In
          </Button>

          {/* Replaced with react-router navigation */}
          <Link
            underline="hover"
            sx={{ display: "block", mb: 1, cursor: "pointer" }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </Link>
          <Typography variant="body2" color="text.secondary">
            Don't have an account?{" "}
            <Link
              underline="hover"
              sx={{ cursor: "pointer" }}
              onClick={() => navigate("/register")}
            >
              Register
            </Link>
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
