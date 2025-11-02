// src/components/Login/EnhancedLogin.js
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
  Alert,
  Slide,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Business,
  ArrowForward,
  CheckCircle,
  LockOpen,
} from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AnimatedCharacter from "../common/AnimatedCharacter";

const EnhancedLogin = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [success, setSuccess] = useState(false);

  // Animation states
  const [focusedField, setFocusedField] = useState("");
  const [typingInEmail, setTypingInEmail] = useState(false);
  const [typingInPassword, setTypingInPassword] = useState(false);

  // Floating particles
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setShowContent(true);

    // Generate particles
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 25 + 15,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);

    // Hydrate remember me
    const savedEmail = localStorage.getItem("rememberedEmail");
    const remember = localStorage.getItem("rememberMe") === "true";
    if (remember && savedEmail) {
      setForm((prev) => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");

    // Track typing
    if (name === "email") {
      setTypingInEmail(value.length > 0);
    } else if (name === "password") {
      setTypingInPassword(value.length > 0);
    }
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setFocusedField("");
      setTypingInEmail(false);
      setTypingInPassword(false);
    }, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:8080/auth/login", {
        email: form.email,
        password: form.password,
        rememberMe: rememberMe,
      });

      // Store tokens
      const accessToken = data.accessToken;
      const refreshToken = data.refreshToken;
      const rawRoles = Array.isArray(data.roles) ? data.roles : [];

      if (accessToken) localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      if (data.accessTokenExpiresIn) {
        const expiresAt = Date.now() + data.accessTokenExpiresIn;
        localStorage.setItem("tokenExpiresAt", expiresAt);
      }

      // Normalize roles
      let roles = rawRoles.map((r) => r.toLowerCase().replace("role_", ""));

      if (
        roles.some((r) => ["admin", "hr", "director"].includes(r)) &&
        !roles.includes("employee")
      ) {
        roles = [...roles, "employee"];
      }

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

      // Show success animation
      setSuccess(true);
      setError("");

      // Remember-me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", form.email);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // Redirect after animation
      setTimeout(() => {
        const home = {
          admin: "/admin/profile",
          hr: "/hr",
          director: "/director/profile",
          employee: "/employee/profile",
        };
        navigate(home[activeRole] || "/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setSuccess(false);
      if (err.response?.status === 401) {
        setError("Invalid credentials. Please try again.");
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setLoading(false);
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
            "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)",
          animation: "backgroundPulse 15s ease-in-out infinite",
        },
        "@keyframes backgroundPulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.8 },
        },
      }}
    >
      {/* Animated Particles */}
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
            background: "rgba(255, 255, 255, 0.6)",
            animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
            animationDelay: `${particle.delay}s`,
            boxShadow: "0 0 10px rgba(255,255,255,0.3)",
            "@keyframes particleFloat": {
              "0%, 100%": {
                transform: "translateY(0px) translateX(0px)",
                opacity: 0.6,
              },
              "25%": {
                transform: "translateY(-30px) translateX(10px)",
                opacity: 0.8,
              },
              "50%": {
                transform: "translateY(-20px) translateX(-10px)",
                opacity: 1,
              },
              "75%": {
                transform: "translateY(-40px) translateX(5px)",
                opacity: 0.7,
              },
            },
          }}
        />
      ))}

      {/* Animated 3D Character */}
      <Fade in={showContent} timeout={1200}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) translateY(-320px)",
            zIndex: 10,
          }}
        >
          <AnimatedCharacter
            focusedField={focusedField}
            hasError={!!error}
            isSuccess={success}
            isLoading={loading}
            typingInEmail={typingInEmail}
            typingInPassword={typingInPassword}
          />
        </Box>
      </Fade>

      {/* Login Card */}
      <Fade in={showContent} timeout={1000}>
        <Paper
          elevation={24}
          sx={{
            position: "relative",
            zIndex: 5,
            width: "100%",
            maxWidth: 500,
            m: 2,
            p: 5,
            pt: 8,
            borderRadius: 5,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            boxShadow:
              "0 20px 60px 0 rgba(31, 38, 135, 0.37), 0 0 0 1px rgba(255,255,255,0.3)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            animation: "cardSlideUp 0.8s ease-out",
            "@keyframes cardSlideUp": {
              from: {
                opacity: 0,
                transform: "translateY(50px) scale(0.95)",
              },
              to: {
                opacity: 1,
                transform: "translateY(0) scale(1)",
              },
            },
          }}
        >
          {/* Logo Section */}
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
                width: 90,
                height: 90,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 3,
                boxShadow: "0 10px 30px rgba(102, 126, 234, 0.5)",
                animation: "logoSpin 20s linear infinite",
                position: "relative",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  width: "110%",
                  height: "110%",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 3s ease-in-out infinite",
                },
                "@keyframes logoSpin": {
                  "0%": { transform: "rotate(0deg)" },
                  "100%": { transform: "rotate(360deg)" },
                },
                "@keyframes shimmer": {
                  "0%, 100%": { transform: "rotate(0deg)" },
                  "50%": { transform: "rotate(180deg)" },
                },
              }}
            >
              <Business sx={{ fontSize: 45, color: "white", zIndex: 1 }} />
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
                animation: "fadeInDown 1s ease-out 0.3s both",
                "@keyframes fadeInDown": {
                  from: { opacity: 0, transform: "translateY(-20px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              Welcome Back
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                animation: "fadeInDown 1s ease-out 0.5s both",
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
                  borderRadius: 3,
                  animation: "shake 0.5s ease",
                  "@keyframes shake": {
                    "0%, 100%": { transform: "translateX(0)" },
                    "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
                    "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
                  },
                }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            </Slide>
          )}

          {/* Success Alert */}
          {success && (
            <Slide direction="down" in={success} mountOnEnter>
              <Alert
                severity="success"
                icon={<CheckCircle />}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  animation: "successPop 0.5s ease",
                  "@keyframes successPop": {
                    "0%": { transform: "scale(0.8)", opacity: 0 },
                    "50%": { transform: "scale(1.05)", opacity: 1 },
                    "100%": { transform: "scale(1)", opacity: 1 },
                  },
                }}
              >
                Login successful! Redirecting...
              </Alert>
            </Slide>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Box
              sx={{
                animation: "slideInUp 0.8s ease-out 0.6s both",
                "@keyframes slideInUp": {
                  from: { opacity: 0, transform: "translateY(30px)" },
                  to: { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => handleFocus("email")}
                onBlur={handleBlur}
                margin="normal"
                required
                disabled={loading || success}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email
                        sx={{
                          color: focusedField === "email" ? "#667eea" : "inherit",
                          transition: "all 0.3s",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    transition: "all 0.3s",
                    background: "rgba(255,255,255,0.9)",
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                      transform: "translateY(-2px)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 6px 25px rgba(102, 126, 234, 0.3)",
                      transform: "translateY(-3px)",
                      background: "white",
                    },
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                animation: "slideInUp 0.8s ease-out 0.7s both",
              }}
            >
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                onFocus={() => handleFocus("password")}
                onBlur={handleBlur}
                margin="normal"
                required
                disabled={loading || success}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      {showPassword ? (
                        <LockOpen
                          sx={{
                            color: focusedField === "password" ? "#667eea" : "inherit",
                            transition: "all 0.3s",
                          }}
                        />
                      ) : (
                        <Lock
                          sx={{
                            color: focusedField === "password" ? "#667eea" : "inherit",
                            transition: "all 0.3s",
                          }}
                        />
                      )}
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading || success}
                        sx={{
                          transition: "all 0.3s",
                          "&:hover": {
                            transform: "scale(1.1)",
                          },
                        }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    transition: "all 0.3s",
                    background: "rgba(255,255,255,0.9)",
                    "&:hover": {
                      boxShadow: "0 4px 20px rgba(102, 126, 234, 0.15)",
                      transform: "translateY(-2px)",
                    },
                    "&.Mui-focused": {
                      boxShadow: "0 6px 25px rgba(102, 126, 234, 0.3)",
                      transform: "translateY(-3px)",
                      background: "white",
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
                mt: 3,
                mb: 3,
                animation: "slideInUp 0.8s ease-out 0.8s both",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading || success}
                    sx={{
                      color: "#667eea",
                      "&.Mui-checked": {
                        color: "#667eea",
                        animation: "checkBounce 0.3s ease",
                      },
                      "@keyframes checkBounce": {
                        "0%, 100%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.2)" },
                      },
                    }}
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={500}>
                      Remember me
                    </Typography>
                    {rememberMe && (
                      <CheckCircle
                        sx={{
                          fontSize: 16,
                          color: "#667eea",
                          animation: "fadeIn 0.3s ease",
                        }}
                      />
                    )}
                  </Box>
                }
              />

              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => navigate("/forgot-password")}
                disabled={loading || success}
                sx={{
                  color: "#667eea",
                  textDecoration: "none",
                  fontWeight: 600,
                  transition: "all 0.3s",
                  "&:hover": {
                    textDecoration: "underline",
                    transform: "translateX(3px)",
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
                disabled={loading || success}
                endIcon={
                  loading ? null : success ? <CheckCircle /> : <ArrowForward />
                }
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontSize: 17,
                  fontWeight: "bold",
                  textTransform: "none",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  boxShadow: "0 8px 25px 0 rgba(102, 126, 234, 0.5)",
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    transition: "left 0.5s",
                  },
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                    boxShadow: "0 12px 35px 0 rgba(102, 126, 234, 0.7)",
                    transform: "translateY(-3px)",
                    "&::before": {
                      left: "100%",
                    },
                  },
                  "&:active": {
                    transform: "translateY(-1px)",
                  },
                  "&:disabled": {
                    background: "#ccc",
                  },
                }}
              >
                {loading ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        border: "3px solid rgba(255,255,255,0.3)",
                        borderTop: "3px solid white",
                        borderRadius: "50%",
                        animation: "buttonSpin 0.8s linear infinite",
                        "@keyframes buttonSpin": {
                          "0%": { transform: "rotate(0deg)" },
                          "100%": { transform: "rotate(360deg)" },
                        },
                      }}
                    />
                    Signing in...
                  </Box>
                ) : success ? (
                  "Success!"
                ) : (
                  "Sign In"
                )}
              </Button>
            </Box>
          </form>

          {/* Session Info */}
          <Box
            sx={{
              mt: 4,
              textAlign: "center",
              animation: "fadeIn 1s ease-out 1s both",
              "@keyframes fadeIn": {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
              }}
            >
              {rememberMe ? "🔒 You'll stay logged in for 30 days" : "⏱️ Session expires after 7 days"}
            </Typography>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: "1px solid rgba(0,0,0,0.08)",
              textAlign: "center",
              animation: "fadeIn 1s ease-out 1.1s both",
            }}
          >
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Powered by HRMS Portal • Secure & Reliable
            </Typography>
          </Box>
        </Paper>
      </Fade>
    </Box>
  );
};

export default EnhancedLogin;
