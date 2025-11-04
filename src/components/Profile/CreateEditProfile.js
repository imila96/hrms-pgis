import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import { PhotoCamera, Delete, ArrowBack } from "@mui/icons-material";
import axiosInstance from "../../AxiosInstance";

const COLORS = {
  primary: "#4B49AC",
  secondary: "#7DA0FA",
  accent: "#7978E9",
  background: "#F5F5F5",
};

const RELIGIONS = ["Buddhism", "Christianity", "Hinduism", "Islam", "Other"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];

function CreateEditProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "",
    dateOfBirth: "",
    nationality: "",
    nic: "",
    maritalStatus: "",
    religion: "",
    bloodGroup: "",
    email: "",
    phone: "",
    address: "",
    emergencyContact: "",
    // contact tab fields
    permanentAddress: "",
    currentAddress: "",
    mobileNumber: "",
    homeTelephone: "",
    workEmail: "",
    personalEmail: "",
    // emergency contact details
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    // employment tab
    employeeId: "",
    jobTitle: "",
    department: "",
    employmentType: "",
    dateOfJoining: "",
    probationEndDate: "",
    confirmationDate: "",
    dateOfRetirement: "",
    employmentStatus: "",
    // compensation tab
    basicSalary: "",
    bankName: "",
    branch: "",
    accountNo: "",
    tin: "",
    pensionScheme: "",
  });

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await axiosInstance.get(`/hr/employees/${id}`);
        if (!mounted) return;
        const data = res.data || {};
        setForm((f) => ({
          ...f,
          firstName: data.firstName || "",
          middleName: data.middleName || "",
          lastName: data.lastName || "",
          gender: data.gender || "",
          dateOfBirth: data.dateOfBirth || "",
          nationality: data.nationality || "",
          nic: data.nic || "",
          maritalStatus: data.maritalStatus || "",
          religion: data.religion || "",
          bloodGroup: data.bloodGroup || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          emergencyContact: data.emergencyContact || "",
          permanentAddress: data.permanentAddress || data.address || "",
          currentAddress: data.currentAddress || "",
          mobileNumber: data.mobileNumber || data.phone || "",
          homeTelephone: data.homeTelephone || "",
          workEmail: data.workEmail || data.email || "",
          personalEmail: data.personalEmail || "",
          emergencyName: data.emergencyName || "",
          emergencyRelationship: data.emergencyRelationship || "",
          emergencyPhone: data.emergencyPhone || "",
          // employment
          employeeId: data.employeeId || data.id || "",
          jobTitle: data.jobTitle || "",
          department: data.department || "",
          employmentType: data.employmentType || "",
          dateOfJoining: data.dateOfJoining || "",
          probationEndDate: data.probationEndDate || "",
          confirmationDate: data.confirmationDate || "",
          dateOfRetirement: data.dateOfRetirement || "",
          employmentStatus: data.employmentStatus || "",
          // compensation
          basicSalary: data.basicSalary || "",
          bankName: data.bankName || "",
          branch: data.branch || "",
          accountNo: data.accountNo || "",
          tin: data.tin || "",
          pensionScheme: data.pensionScheme || "",
        }));
        if (data.profileImage) setProfileImage(data.profileImage);
      } catch (err) {
        // ignore for now
        console.error("Failed to fetch employee:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setProfileImage(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => setProfileImage(null);

  const handleChange = (field) => (e) =>
    setForm({ ...form, [field]: e.target.value });

  const handleSave = async () => {
    const payload = { ...form, profileImage };
    try {
      if (id) {
        await axiosInstance.put(`/hr/employees/${id}`, payload);
      } else {
        await axiosInstance.post(`/hr/employees`, payload);
      }
      navigate("/hr/records");
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const isFormValid = () => {
    return !!(
      form.firstName &&
      form.lastName &&
      form.gender &&
      form.dateOfBirth &&
      form.nationality &&
      form.nic
    );
  };

  return (
    <Box sx={{ p: 3, bgcolor: COLORS.background, minHeight: "100vh" }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton onClick={() => navigate("/hr/records")}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" sx={{ color: COLORS.primary }}>
          {id ? "Edit Employee" : "Add New Employee"}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2 }}>
        {/* Left column (smaller) */}
        <Paper sx={{ p: 2, flex: "0 0 300px" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Avatar
              src={profileImage}
              sx={{
                width: 200,
                height: 200,
                border: `3px solid ${COLORS.primary}`,
              }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<PhotoCamera />}
                sx={{ bgcolor: COLORS.primary }}
              >
                Upload
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={handleImageUpload}
                />
              </Button>
              <IconButton
                color="error"
                onClick={handleRemoveImage}
                disabled={!profileImage}
              >
                <Delete />
              </IconButton>
            </Box>

            <Typography variant="caption" color="text.secondary" align="center">
              Upload a profile picture (recommended size: 200x200px)
            </Typography>

            <Box sx={{ mt: 2, display: "flex", gap: 1, width: "100%" }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/hr/records")}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!isFormValid()}
                fullWidth
                sx={{ bgcolor: COLORS.primary }}
              >
                {id ? "Save Changes" : "Add Employee"}
              </Button>
            </Box>
          </Box>
        </Paper>

        {/* Right column (form & tabs) */}
        <Paper sx={{ flex: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              sx={{
                px: 2,
                "& .MuiTabs-indicator": { backgroundColor: COLORS.primary },
              }}
            >
              <Tab label="Personal Information" />
              <Tab label="Contact Information" />
              <Tab label="Employment Details" />
              <Tab label="Compensation & Payroll" />
            </Tabs>
          </Box>

          {/* Personal Information Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 4, color: COLORS.primary }}>
                Personal Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    label="First Name"
                    placeholder="Enter first name"
                    fullWidth
                    required
                    value={form.firstName}
                    onChange={handleChange("firstName")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Middle Name"
                    placeholder="Enter middle name (optional)"
                    fullWidth
                    value={form.middleName}
                    onChange={handleChange("middleName")}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Last Name"
                    placeholder="Enter last name"
                    fullWidth
                    required
                    value={form.lastName}
                    onChange={handleChange("lastName")}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel>Gender</InputLabel>
                    <Select
                      value={form.gender}
                      label="Gender"
                      onChange={handleChange("gender")}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Date of Birth"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    fullWidth
                    required
                    value={form.dateOfBirth}
                    onChange={handleChange("dateOfBirth")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Nationality"
                    placeholder="Enter nationality"
                    fullWidth
                    required
                    value={form.nationality}
                    onChange={handleChange("nationality")}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="NIC Number"
                    placeholder="e.g. 123456789V"
                    fullWidth
                    required
                    value={form.nic}
                    onChange={handleChange("nic")}
                    helperText="Enter valid National Identity Card number"
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Marital Status</InputLabel>
                    <Select
                      value={form.maritalStatus}
                      label="Marital Status"
                      onChange={handleChange("maritalStatus")}
                    >
                      {MARITAL_STATUS.map((s) => (
                        <MenuItem key={s} value={s.toLowerCase()}>
                          {s}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Religion</InputLabel>
                    <Select
                      value={form.religion}
                      label="Religion"
                      onChange={handleChange("religion")}
                    >
                      {RELIGIONS.map((r) => (
                        <MenuItem key={r} value={r.toLowerCase()}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Blood Group</InputLabel>
                    <Select
                      value={form.bloodGroup}
                      label="Blood Group"
                      onChange={handleChange("bloodGroup")}
                    >
                      {BLOOD_GROUPS.map((b) => (
                        <MenuItem key={b} value={b}>
                          {b}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1,
                  mt: 3,
                }}
              >
                <Button variant="contained" onClick={() => setActiveTab(1)}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Contact Information Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                Contact Information
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="Permanent Address"
                    placeholder="Enter permanent address"
                    fullWidth
                    multiline
                    rows={2}
                    value={form.permanentAddress}
                    onChange={handleChange("permanentAddress")}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Current Address"
                    placeholder="Enter current address"
                    fullWidth
                    multiline
                    rows={2}
                    value={form.currentAddress}
                    onChange={handleChange("currentAddress")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Mobile Number"
                    placeholder="e.g. +94 77 123 4567"
                    fullWidth
                    value={form.mobileNumber}
                    onChange={handleChange("mobileNumber")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Home Telephone (optional)"
                    placeholder="e.g. +94 11 234 5678"
                    fullWidth
                    value={form.homeTelephone}
                    onChange={handleChange("homeTelephone")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Work Email"
                    type="email"
                    placeholder="e.g. name@company.com"
                    fullWidth
                    value={form.workEmail}
                    onChange={handleChange("workEmail")}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Personal Email"
                    type="email"
                    placeholder="e.g. name@example.com"
                    fullWidth
                    value={form.personalEmail}
                    onChange={handleChange("personalEmail")}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Emergency Contact
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <TextField
                      label="Name"
                      placeholder="Emergency contact full name"
                      fullWidth
                      value={form.emergencyName}
                      onChange={handleChange("emergencyName")}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Relationship"
                      placeholder="e.g. Spouse, Parent, Friend"
                      fullWidth
                      value={form.emergencyRelationship}
                      onChange={handleChange("emergencyRelationship")}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      label="Phone Number"
                      placeholder="e.g. +94 77 123 4567"
                      fullWidth
                      value={form.emergencyPhone}
                      onChange={handleChange("emergencyPhone")}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mt: 3,
                }}
              >
                <Button variant="outlined" onClick={() => setActiveTab(0)}>
                  Back
                </Button>
                <Button variant="contained" onClick={() => setActiveTab(2)}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Employment Details Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                Employment Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    label="Employee ID"
                    placeholder="Auto-generated"
                    fullWidth
                    value={form.employeeId}
                    disabled
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Job Title / Position"
                    placeholder="e.g. Senior Software Engineer"
                    fullWidth
                    value={form.jobTitle}
                    onChange={handleChange("jobTitle")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Department"
                    placeholder="e.g. Engineering"
                    fullWidth
                    value={form.department}
                    onChange={handleChange("department")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      value={form.employmentType}
                      label="Employment Type"
                      onChange={handleChange("employmentType")}
                    >
                      <MenuItem value="permanent">Permanent</MenuItem>
                      <MenuItem value="contract">Contract</MenuItem>
                      <MenuItem value="temporary">Temporary</MenuItem>
                      <MenuItem value="intern">Intern</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Date of Joining"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    fullWidth
                    value={form.dateOfJoining}
                    onChange={handleChange("dateOfJoining")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Probation End Date"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    fullWidth
                    value={form.probationEndDate}
                    onChange={handleChange("probationEndDate")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Confirmation Date"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    fullWidth
                    value={form.confirmationDate}
                    onChange={handleChange("confirmationDate")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Date of Retirement"
                    placeholder="YYYY-MM-DD"
                    type="date"
                    fullWidth
                    value={form.dateOfRetirement}
                    onChange={handleChange("dateOfRetirement")}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Status</InputLabel>
                    <Select
                      value={form.employmentStatus}
                      label="Employment Status"
                      onChange={handleChange("employmentStatus")}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="on_leave">On Leave</MenuItem>
                      <MenuItem value="terminated">Terminated</MenuItem>
                      <MenuItem value="retired">Retired</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mt: 3,
                }}
              >
                <Button variant="outlined" onClick={() => setActiveTab(1)}>
                  Back
                </Button>
                <Button variant="contained" onClick={() => setActiveTab(3)}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Compensation & Payroll Tab */}
          {activeTab === 3 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                Compensation & Payroll
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <TextField
                    label="Basic Salary"
                    placeholder="Enter basic salary (e.g. 50000)"
                    type="number"
                    fullWidth
                    value={form.basicSalary}
                    onChange={handleChange("basicSalary")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Bank Name"
                    placeholder="e.g. National Bank"
                    fullWidth
                    value={form.bankName}
                    onChange={handleChange("bankName")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Branch"
                    placeholder="e.g. Colombo"
                    fullWidth
                    value={form.branch}
                    onChange={handleChange("branch")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Account Number"
                    placeholder="Enter bank account number"
                    fullWidth
                    value={form.accountNo}
                    onChange={handleChange("accountNo")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Tax Identification No (TIN)"
                    placeholder="Enter TIN"
                    fullWidth
                    value={form.tin}
                    onChange={handleChange("tin")}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Pension Scheme"
                    placeholder="e.g. Contributory / Non-contributory"
                    fullWidth
                    value={form.pensionScheme}
                    onChange={handleChange("pensionScheme")}
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mt: 3,
                }}
              >
                <Button variant="outlined" onClick={() => setActiveTab(2)}>
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={!isFormValid()}
                >
                  Finish
                </Button>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}

export default CreateEditProfile;
