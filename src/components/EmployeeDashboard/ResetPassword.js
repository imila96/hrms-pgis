/**
 * ResetPassword.js
 * 
 * Password reset component for employee dashboard.
 * Allows employees to change their password with proper validation.
 */

import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Lock, Visibility, VisibilityOff, CheckCircle } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../AxiosInstance";
import { useAuth } from "../../context/AuthContext";
import BackButton from "../common/BackButton";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    // Clear validation error for this field
    setValidationErrors({ ...validationErrors, [field]: "" });
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    
    if (!formData.newPassword) {
      errors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword === formData.newPassword) {
      errors.newPassword = "New password must be different from current password";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/auth/change-password", {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      // Show success dialog
      setShowSuccessDialog(true);
    } catch (err) {
      const errorMessage = 
        err.response?.data?.message || 
        err.response?.data || 
        "Failed to change password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    // Logout and redirect to login
    logout();
    navigate("/");
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    const levels = [
      { strength: 1, text: "Weak", color: "#F3797E" },
      { strength: 2, text: "Fair", color: "#FFA726" },
      { strength: 3, text: "Good", color: "#66BB6A" },
      { strength: 4, text: "Strong", color: "#4B49AC" },
      { strength: 5, text: "Very Strong", color: "#7978E9" },
    ];

    return levels[strength - 1] || { strength: 0, text: "", color: "" };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <Box
      sx={{
        animation: "slideUp 0.4s ease-out",
        "@keyframes slideUp": {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      <BackButton />
      
      {/* Header */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #4B49AC 0%, #7DA0FA 100%)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(75,73,172,0.3)",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Lock sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" fontWeight={700}>
              Reset Password
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
              Change your password to keep your account secure
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Form */}
      <Paper
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 600,
          mx: "auto",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        }}
      >
        <form onSubmit={handleSubmit}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Current Password */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="Current Password"
              type={showPasswords.current ? "text" : "password"}
              fullWidth
              required
              value={formData.currentPassword}
              onChange={handleChange("currentPassword")}
              error={!!validationErrors.currentPassword}
              helperText={validationErrors.currentPassword}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("current")}
                      edge="end"
                    >
                      {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* New Password */}
          <Box sx={{ mb: 3 }}>
            <TextField
              label="New Password"
              type={showPasswords.new ? "text" : "password"}
              fullWidth
              required
              value={formData.newPassword}
              onChange={handleChange("newPassword")}
              error={!!validationErrors.newPassword}
              helperText={
                validationErrors.newPassword ||
                "Password must be at least 6 characters"
              }
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("new")}
                      edge="end"
                    >
                      {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
            
            {/* Password Strength Indicator */}
            {formData.newPassword && passwordStrength.text && (
              <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    flex: 1,
                    height: 6,
                    bgcolor: "#e0e0e0",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${(passwordStrength.strength / 5) * 100}%`,
                      height: "100%",
                      bgcolor: passwordStrength.color,
                      transition: "all 0.3s ease",
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{ color: passwordStrength.color, fontWeight: 600, minWidth: 80 }}
                >
                  {passwordStrength.text}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Confirm Password */}
          <Box sx={{ mb: 4 }}>
            <TextField
              label="Confirm New Password"
              type={showPasswords.confirm ? "text" : "password"}
              fullWidth
              required
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility("confirm")}
                      edge="end"
                    >
                      {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            />
          </Box>

          {/* Password Requirements */}
          <Box
            sx={{
              mb: 3,
              p: 2,
              bgcolor: "#f8f9ff",
              borderRadius: 2,
              border: "1px solid #e0e4ff",
            }}
          >
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              Password Requirements:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • At least 6 characters long
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Different from your current password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              • Recommended: Mix of uppercase, lowercase, numbers, and special characters
            </Typography>
          </Box>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            sx={{
              bgcolor: "#4B49AC",
              py: 1.5,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "1rem",
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#3d3a8f",
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(75,73,172,0.3)",
              },
              transition: "all 0.2s ease",
              "&:disabled": {
                bgcolor: "#ccc",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "#fff" }} />
            ) : (
              "Change Password"
            )}
          </Button>
        </form>
      </Paper>

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onClose={handleSuccessClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 2,
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
          <CheckCircle sx={{ fontSize: 60, color: "#66BB6A", mb: 1 }} />
          <Typography variant="h5" fontWeight={700}>
            Password Changed Successfully
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ textAlign: "center", fontSize: "1rem" }}>
            Your password has been changed successfully. For security reasons, you
            will be logged out from all devices. Please login again with your new
            password.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pt: 2 }}>
          <Button
            onClick={handleSuccessClose}
            variant="contained"
            sx={{
              bgcolor: "#4B49AC",
              px: 4,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              "&:hover": {
                bgcolor: "#3d3a8f",
              },
            }}
          >
            Okay, Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
