// src/components/Login/Login.js
import React, { useState, useEffect } from "react";
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

  // hydrate "remember me"
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    const savedPassword = localStorage.getItem("rememberedPassword");
    const remember = localStorage.getItem("rememberMe") === "true";

    if (remember && savedEmail && savedPassword) {
      setForm({ email: savedEmail, password: savedPassword });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post("http://localhost:8080/auth/login", {
        email: form.email,
        password: form.password,
      });

      const accessToken = data.accessToken || data.token;
      const rawRoles = Array.isArray(data.roles) ? data.roles : [];

      // Normalize backend roles like ["ROLE_ADMIN","ROLE_EMPLOYEE"] -> ["admin","employee"]
      let roles = rawRoles.map((r) => r.toLowerCase().replace("role_", ""));

      // Ensure elevated roles can also switch to employee view
      if (
        roles.some((r) => ["admin", "hr", "director"].includes(r)) &&
        !roles.includes("employee")
      ) {
        roles = [...roles, "employee"];
      }

      // Choose default active role (priority: admin > hr > director > employee)
      const priority = ["admin", "hr", "director", "employee"];
      const activeRole =
        priority.find((r) => roles.includes(r)) || roles[0] || "employee";

      // Persist session
      if (accessToken) localStorage.setItem("token", accessToken);
      localStorage.setItem("email", form.email);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("activeRole", activeRole);
      // keep legacy single "role" for any leftover checks
      localStorage.setItem("role", activeRole);

      // Update context
      setUser({ email: form.email, roles, activeRole });

      setError("");

      // Remember-me persistence
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
        localStorage.setItem("rememberedPassword", form.password);
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
        localStorage.setItem("rememberMe", "false");
      }

      // Redirect based on active role
      const home = {
        admin: "/admin/profile",
        hr: "/hr/profile",
        director: "/director/profile",
        employee: "/employee/profile",
      };
      navigate(home[activeRole] || "/");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
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
                    onClick={() => setShowPassword((prev) => !prev)}
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

          <Link
            underline="hover"
            sx={{ display: "block", mb: 1, cursor: "pointer" }}
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </Link>
        </form>
      </Box>
    </Box>
  );
};

export default Login;
