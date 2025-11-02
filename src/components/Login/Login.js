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
  Paper,
  Fade,
  Slide,
  Zoom,
  Alert,
} from "@mui/material";
import { 
  Visibility, 
  VisibilityOff, 
  Email, 
  Lock,
  Business,
  ArrowForward,
  CheckCircle,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BusinessAvatar from "./BusinessAvatar";

const Login = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  
  // Character animation states
  const [focusedField, setFocusedField] = useState("");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Floating particles animation
  const [particles, setParticles] = useState([]);

  // Email validation helper
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const emailIsValid = form.email.length > 0 && isValidEmail(form.email);
  const emailIsInvalid = emailTouched && form.email.length > 0 && !isValidEmail(form.email);

  useEffect(() => {
    setShowContent(true);
    
    // Generate random particles for background animation
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 3,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);

    // Hydrate "remember me"
    const savedEmail = localStorage.getItem("rememberedEmail");
    const remember = localStorage.getItem("rememberMe") === "true";
    if (remember && savedEmail) {
      setForm(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    // Mouse tracking for character eye movement
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = (fieldName) => {
    setTimeout(() => setFocusedField(""), 200);
    if (fieldName === "email") {
      setEmailTouched(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate email format before submitting
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      setEmailTouched(true);
      return;
    }
    
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:8080/auth/login", {
        email: form.email,
        password: form.password,
        rememberMe: rememberMe,
      });

      // Store access token and refresh token
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const rawRoles = Array.isArray(data.roles) ? data.roles : [];

      // Store tokens
      if (accessToken) localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      
      // Store token expiration time
      if (data.accessTokenExpiresIn) {
        const expiresAt = Date.now() + data.accessTokenExpiresIn;
        localStorage.setItem("tokenExpiresAt", expiresAt);
      }

      // Normalize backend roles
      let roles = rawRoles.map((r) => r.toLowerCase().replace("role_", ""));

      // Ensure elevated roles can also switch to employee view
      if (
        roles.some((r) => ["admin", "hr", "director"].includes(r)) &&
        !roles.includes("employee")
      ) {
        roles = [...roles, "employee"];
      }

      // Choose default active role
      const priority = ["admin", "hr", "director", "employee"];
      const activeRole =
        priority.find((r) => roles.includes(r)) || roles[0] || "employee";

      // Persist session
      localStorage.setItem("email", form.email);
      localStorage.setItem("roles", JSON.stringify(roles));
      localStorage.setItem("activeRole", activeRole);
      localStorage.setItem("role", activeRole);
      localStorage.setItem("rememberMe", rememberMe ? "true" : "false");

      // Update context
      setUser({ email: form.email, roles, activeRole });

      // Show success state
      setIsSuccess(true);
      setError("");

      // Remember-me persistence
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // Redirect after success animation
      setTimeout(() => {
        const home = {
          admin: "/admin/profile",
          hr: "/hr",
          director: "/director/profile",
          employee: "/employee/profile",
        };
        navigate(home[activeRole] || "/");
      }, 1200);
    } catch (err) {
      console.error("Login error:", err);
      setIsSuccess(false);
      
      // Handle different error scenarios
      if (err.code === "ERR_NETWORK") {
        setError("Unable to connect to server. Please check your internet connection.");
      } else if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const errorMessage = err.response.data?.message || err.response.data?.error || "";
        
        if (status === 401) {
          // Authentication failed - wrong credentials (backend now returns 401)
          setError("Incorrect email or password. Please try again.");
        } else if (status === 403) {
          // Authorization failed - account restricted
          setError("Access denied. Your account may be inactive or restricted.");
        } else if (status === 404) {
          // User not found
          setError("Account not found. Please check your email or contact support.");
        } else if (status === 423) {
          // Account locked
          setError("Your account has been locked. Please contact support.");
        } else if (status === 500 || status === 503) {
          // Server error
          setError("Server error. Please try again later or contact support.");
        } else {
          // Other server errors - use backend message if available
          setError(errorMessage || "Login failed. Please try again.");
        }
      } else {
        // Unknown error
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      if (!isSuccess) {
        setLoading(false);
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
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          animation: "pulse 10s ease-in-out infinite",
        },
      }}
    >
      {/* Animated Background Particles */}
      {particles.map((particle) => (
        <Box
          key={particle.id}
          sx={{
            position: "absolute",
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.5)",
            animation: `float ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            "@keyframes float": {
              "0%, 100%": {
                transform: "translateY(0px)",
                opacity: 0.5,
              },
              "50%": {
                transform: "translateY(-20px)",
                opacity: 1,
              },
            },
          }}
        />
      ))}

      {/* Main Container for Avatar and Login Card */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          zIndex: 1,
          maxWidth: "1200px",
          width: "100%",
          px: 2,
        }}
      >
        {/* Business Character Avatar - Left Side */}
        <Fade in={showContent} timeout={1500}>
          <Box
            sx={{
              display: { xs: "none", md: "block" }, // Hide on mobile, show on desktop
              flexShrink: 0,
            }}
          >
            <BusinessAvatar
              focusedField={focusedField}
              isError={!!error}
              isSuccess={isSuccess}
              isLoading={loading}
              mousePosition={mousePosition}
              hasPassword={form.password.length > 0}
            />
          </Box>
        </Fade>

        {/* Login Card - Right Side */}
        <Fade in={showContent} timeout={1000}>
          <Paper
            elevation={24}
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: 480,
              p: 5,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              animation: "scaleIn 0.5s ease-out",
            }}
          >
            {/* Logo/Icon Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                  boxShadow: "0 8px 16px rgba(102, 126, 234, 0.4)",
                  animation: "scaleIn 0.8s ease-out 0.3s both",
                }}
              >
                <Business sx={{ fontSize: 40, color: "white" }} />
              </Box>
            
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                mb: 1,
                animation: "fadeIn 1s ease-out 0.5s both",
              }}
            >
              Welcome Back
            </Typography>
            
            <Typography
              color="text.secondary"
              sx={{
                animation: "fadeIn 1s ease-out 0.7s both",
              }}
            >
              Sign in to access your HRMS Portal
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Slide direction="down" in={!!error} mountOnEnter unmountOnExit>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  borderRadius: 2,
                  animation: "slideInUp 0.3s ease-out",
                }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            </Slide>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ animation: "slideInUp 0.8s ease-out 0.6s both" }}>
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email")}
                margin="normal"
                required
                disabled={loading}
                autoComplete="email"
                error={emailIsInvalid}
                helperText={emailIsInvalid ? "Please enter a valid email address" : ""}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color={emailIsInvalid ? "error" : emailIsValid ? "success" : "primary"} />
                    </InputAdornment>
                  ),
                  endAdornment: emailIsValid && (
                    <InputAdornment position="end">
                      <CheckCircle sx={{ color: "#22c55e", fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                    },
                    "&.Mui-error": {
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.25)",
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ animation: "slideInUp 0.8s ease-out 0.7s both" }}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onClick={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                margin="normal"
                required
                disabled={loading}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    transition: "all 0.3s",
                    "&:hover": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.15)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 4px 12px rgba(102, 126, 234, 0.25)",
                    },
                  },
                }}
              />
            </Box>

            <Box 
              sx={{ 
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: 2,
                mb: 3,
                animation: "slideInUp 0.8s ease-out 0.8s both",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    sx={{
                      color: "#667eea",
                      "&.Mui-checked": {
                        color: "#667eea",
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2">Remember me</Typography>
                    {rememberMe && (
                      <Zoom in={rememberMe}>
                        <CheckCircle sx={{ fontSize: 16, color: "#667eea" }} />
                      </Zoom>
                    )}
                  </Box>
                }
              />
              
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate("/forgot-password")}
                disabled={loading}
                sx={{
                  color: "#667eea",
                  textDecoration: "none",
                  fontWeight: 500,
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
              >
                Forgot Password?
              </Link>
            </Box>

            <Box sx={{ animation: "slideInUp 0.8s ease-out 0.9s both" }}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || emailIsInvalid || !emailIsValid || form.password.length === 0}
                endIcon={loading ? null : <ArrowForward />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: 16,
                  fontWeight: "bold",
                  textTransform: "none",
                  background: (emailIsInvalid || !emailIsValid || form.password.length === 0) && !loading
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: (emailIsInvalid || !emailIsValid || form.password.length === 0) && !loading
                    ? "0 4px 15px 0 rgba(239, 68, 68, 0.4)"
                    : "0 4px 15px 0 rgba(102, 126, 234, 0.4)",
                  transition: "all 0.3s",
                  "&:hover:not(:disabled)": {
                    background: "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    boxShadow: "0 6px 20px 0 rgba(102, 126, 234, 0.6)",
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: (emailIsInvalid || !emailIsValid || form.password.length === 0) && !loading
                      ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                      : "#ccc",
                    color: (emailIsInvalid || !emailIsValid || form.password.length === 0) && !loading
                      ? "#fff"
                      : "rgba(0, 0, 0, 0.26)",
                    opacity: (emailIsInvalid || !emailIsValid || form.password.length === 0) && !loading
                      ? 0.8
                      : 0.6,
                  },
                }}
              >
                {loading 
                  ? "Signing in..." 
                  : emailIsInvalid 
                  ? "❌ Invalid Email Format"
                  : !emailIsValid
                  ? "⚠️ Please Enter Email"
                  : form.password.length === 0
                  ? "⚠️ Password Required"
                  : "Sign In"}
              </Button>
            </Box>
          </form>

          {/* Session Info */}
          <Box 
            sx={{ 
              mt: 3, 
              textAlign: "center",
              animation: "fadeIn 1s ease-out 1s both",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {rememberMe 
                ? "🔒 You'll stay logged in for 30 days" 
                : "⏱️ Session expires after 7 days"}
            </Typography>
          </Box>

          {/* Footer */}
          <Box 
            sx={{ 
              mt: 4, 
              pt: 3, 
              borderTop: "1px solid rgba(0,0,0,0.1)",
              textAlign: "center",
              animation: "fadeIn 1s ease-out 1.1s both",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Powered by HRMS Portal • Secure & Reliable
            </Typography>
          </Box>
        </Paper>
      </Fade>
      </Box>

      {/* Pulse Animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </Box>
  );
};

export default Login;
