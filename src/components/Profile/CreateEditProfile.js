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
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert,
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
const DEPARTMENTS = [
  "General Administration Division",
  "Finance Administration Division",
  "IT & Technical Support Unit",
  "Maintenance & Facilities Unit",
  "Biochemistry and Molecular Biology",
  "Biomedical Sciences",
  "Chemical Sciences",
  "Earth Sciences",
  "Environmental Science",
  "Mathematics",
  "Physics",
  "Plant Sciences",
  "Science Education",
  "Statistics and Computer Science",
  "Zoological Sciences",
  "other",
];

function CreateEditProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [profileImage, setProfileImage] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
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

  const [errors, setErrors] = useState({});

  // UX state
  const [isSaving, setIsSaving] = useState(false);
  const [savingTab, setSavingTab] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s-]{7,}$/;
  // NIC format: 9 digits followed by an uppercase 'V' (example: 962834153V)
  const nicRegex = /^\d{9}V$/;

  const setFieldError = (field, message) =>
    setErrors((e) => ({ ...e, [field]: message }));
  const clearFieldError = (field) =>
    setErrors((e) => {
      const copy = { ...e };
      delete copy[field];
      return copy;
    });

  const validateField = (field, value) => {
    switch (field) {
      case "firstName":
      case "lastName":
      case "nationality":
        if (!value || !String(value).trim())
          setFieldError(field, "This field is required");
        else clearFieldError(field);
        break;
      case "nic":
        if (!value || !String(value).trim()) {
          setFieldError(field, "This field is required");
        } else if (!nicRegex.test(String(value).trim())) {
          setFieldError(
            field,
            "NIC must be 9 digits followed by 'V' (e.g. 962834153V)"
          );
        } else clearFieldError(field);
        break;
      case "gender":
        if (!value) setFieldError(field, "Please select gender");
        else clearFieldError(field);
        break;
      case "dateOfBirth":
        if (!value) setFieldError(field, "Please provide date of birth");
        else clearFieldError(field);
        break;
      case "email":
      case "workEmail":
      case "personalEmail":
        if (value && !emailRegex.test(value))
          setFieldError(field, "Invalid email address");
        else clearFieldError(field);
        break;
      case "mobileNumber":
      case "emergencyPhone":
      case "homeTelephone":
        if (value && !phoneRegex.test(value))
          setFieldError(field, "Invalid phone number");
        else clearFieldError(field);
        break;
      case "basicSalary":
        if (value !== "" && Number(value) <= 0)
          setFieldError(field, "Salary must be greater than 0");
        else clearFieldError(field);
        break;
      default:
        clearFieldError(field);
    }
  };

  const employeeIdPresent = id || form.employeeId;

  const personalFields = [
    "firstName",
    "lastName",
    "gender",
    "dateOfBirth",
    "nationality",
    "nic",
  ];

  const contactFields = [
    "permanentAddress",
    "mobileNumber",
    "workEmail",
    "personalEmail",
    "emergencyName",
    "emergencyPhone",
  ];

  const employmentFields = ["jobTitle", "dateOfJoining", "employmentType"];
  const compensationFields = ["basicSalary", "accountNo"];

  const isTabValid = (tab) => {
    if (tab === 0) {
      for (const f of personalFields)
        if (!form[f] || String(form[f]).trim() === "") return false;
      if (form.email && !emailRegex.test(form.email)) return false;
      return true;
    }
    if (tab === 1) {
      if (!form.permanentAddress || String(form.permanentAddress).trim() === "")
        return false;
      if (!form.mobileNumber && !form.workEmail && !form.personalEmail)
        return false;
      if (form.workEmail && !emailRegex.test(form.workEmail)) return false;
      if (form.personalEmail && !emailRegex.test(form.personalEmail))
        return false;
      if (!form.emergencyName || !form.emergencyPhone) return false;
      if (form.emergencyPhone && !phoneRegex.test(form.emergencyPhone))
        return false;
      return true;
    }
    if (tab === 2) {
      if (!form.jobTitle || String(form.jobTitle).trim() === "") return false;
      if (!form.dateOfJoining) return false;
      return true;
    }
    if (tab === 3) {
      if (form.basicSalary === "" || form.basicSalary == null) return false;
      if (Number(form.basicSalary) <= 0) return false;
      return true;
    }
    return true;
  };

  const validateTab = (tab) => {
    const newErrors = {};
    if (tab === 0) {
      personalFields.forEach((f) => {
        const v = form[f];
        if (!v || String(v).trim() === "")
          newErrors[f] = "This field is required";
      });
      if (form.email && !emailRegex.test(form.email))
        newErrors.email = "Invalid email address";
      // validate NIC format: 10 digits followed by a letter
      if (form.nic && !nicRegex.test(String(form.nic).trim()))
        newErrors.nic =
          "NIC must be 10 digits followed by a letter (e.g. 0123456789A)";
    }
    if (tab === 1) {
      if (!form.permanentAddress || String(form.permanentAddress).trim() === "")
        newErrors.permanentAddress = "Permanent address is required";
      if (!form.mobileNumber && !form.workEmail && !form.personalEmail)
        newErrors.mobileNumber =
          "Provide at least one contact (mobile or email)";
      if (form.workEmail && !emailRegex.test(form.workEmail))
        newErrors.workEmail = "Invalid work email";
      if (form.personalEmail && !emailRegex.test(form.personalEmail))
        newErrors.personalEmail = "Invalid personal email";
      if (!form.emergencyName || String(form.emergencyName).trim() === "")
        newErrors.emergencyName = "Emergency contact name required";
      if (!form.emergencyPhone || !phoneRegex.test(form.emergencyPhone))
        newErrors.emergencyPhone = "Valid emergency phone required";
    }
    if (tab === 2) {
      if (!form.jobTitle || String(form.jobTitle).trim() === "")
        newErrors.jobTitle = "Job title is required";
      if (!form.dateOfJoining)
        newErrors.dateOfJoining = "Date of joining is required";
    }
    if (tab === 3) {
      if (form.basicSalary === "" || form.basicSalary == null)
        newErrors.basicSalary = "Basic salary is required";
      else if (Number(form.basicSalary) <= 0)
        newErrors.basicSalary = "Salary must be greater than 0";
    }

    // clear previous errors for the tab fields then set new
    const cleaned = { ...errors };
    const tabFields =
      tab === 0
        ? personalFields
        : tab === 1
        ? contactFields
        : tab === 2
        ? employmentFields
        : compensationFields;
    tabFields.forEach((f) => delete cleaned[f]);
    const merged = { ...cleaned, ...newErrors };
    setErrors(merged);
    return Object.keys(newErrors).length === 0;
  };

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

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
    validateField(field, value);
  };

  // Helper: map frontend form to backend EmployeeDto shape
  const buildEmployeeDto = () => ({
    name: (form.firstName || "") + (form.lastName ? " " + form.lastName : ""),
    email: form.email || form.workEmail || form.personalEmail || null,
    gender: form.gender || null,
    dateOfBirth: form.dateOfBirth || null,
    nationality: form.nationality || null,
    nicNo: form.nic || null,
    maritalStatus: form.maritalStatus || null,
    religion: form.religion || null,
    bloodGroup: form.bloodGroup || null,
    profileImage: profileImage || null,
  });

  const buildContactDto = () => ({
    permanentAddress: form.permanentAddress || null,
    currentAddress: form.currentAddress || null,
    mobileNumber: form.mobileNumber || null,
    homeTelephone: form.homeTelephone || null,
    workEmail: form.workEmail || null,
    personalEmail: form.personalEmail || null,
    emergencyName: form.emergencyName || null,
    emergencyRelationship: form.emergencyRelationship || null,
    emergencyPhone: form.emergencyPhone || null,
  });

  const buildEmploymentDto = () => ({
    jobTitle: form.jobTitle || null,
    department: form.department || null,
    dateOfJoining: form.dateOfJoining || null,
    probationEndDate: form.probationEndDate || null,
    confirmationDate: form.confirmationDate || null,
    dateOfRetirement: form.dateOfRetirement || null,
    employmentStatus: form.employmentStatus || null,
  });

  const buildCompensationDto = () => ({
    basicSalary: form.basicSalary || null,
    bankName: form.bankName || null,
    branch: form.branch || null,
    accountNo: form.accountNo || null,
    tin: form.tin || null,
    pensionScheme: form.pensionScheme || null,
  });

  // Create/update employee(personal information)
  const saveEmployee = async () => {
    const dto = buildEmployeeDto();
    if (id) {
      const res = await axiosInstance.put(`/hr/employees/${id}`, dto);
      return res.data?.id || id;
    } else if (form.employeeId) {
      // form may hold employeeId from earlier creation
      const res = await axiosInstance.put(
        `/hr/employees/${form.employeeId}`,
        dto
      );
      return res.data?.id || form.employeeId;
    } else {
      const res = await axiosInstance.post(`/hr/employees`, dto);
      return res.data?.id;
    }
  };

  // Create/update employee(contact information)
  const saveContact = async (employeeId) => {
    const dto = buildContactDto();
    const listRes = await axiosInstance.get(
      `/hr/employees/${employeeId}/contacts`
    );
    const list = listRes.data || [];
    if (list.length > 0) {
      const contactId = list[0].contactId;
      const res = await axiosInstance.put(
        `/hr/employees/${employeeId}/contacts/${contactId}`,
        dto
      );
      return res.data;
    } else {
      const res = await axiosInstance.post(
        `/hr/employees/${employeeId}/contacts`,
        dto
      );
      return res.data;
    }
  };

  // Create/update employee(employment information)
  const saveEmployment = async (employeeId) => {
    const dto = buildEmploymentDto();
    const listRes = await axiosInstance.get(
      `/hr/employees/${employeeId}/employments`
    );
    const list = listRes.data || [];
    if (list.length > 0) {
      const employmentId = list[0].employmentId;
      const res = await axiosInstance.put(
        `/hr/employees/${employeeId}/employments/${employmentId}`,
        dto
      );
      return res.data;
    } else {
      const res = await axiosInstance.post(
        `/hr/employees/${employeeId}/employments`,
        dto
      );
      return res.data;
    }
  };

  // Create/update employee(compensation information)
  const saveCompensation = async (employeeId) => {
    const dto = buildCompensationDto();
    const listRes = await axiosInstance.get(
      `/hr/employees/${employeeId}/compensations`
    );
    const list = listRes.data || [];
    if (list.length > 0) {
      const compensationId = list[0].compensationId;
      const res = await axiosInstance.put(
        `/hr/employees/${employeeId}/compensations/${compensationId}`,
        dto
      );
      return res.data;
    } else {
      const res = await axiosInstance.post(
        `/hr/employees/${employeeId}/compensations`,
        dto
      );
      return res.data;
    }
  };

  const handleSaveTab = async (tabIndex) => {
    if (!validateTab(tabIndex)) return;
    setIsSaving(true);
    setSavingTab(tabIndex);
    try {
      let employeeId = id || form.employeeId;

      if (tabIndex === 0) {
        await saveEmployee();
      } else if (tabIndex === 1) {
        await saveContact(employeeId);
      } else if (tabIndex === 2) {
        await saveEmployment(employeeId);
      } else if (tabIndex === 3) {
        await saveCompensation(employeeId);
      }

      setSnackbar({
        open: true,
        message:
          tabIndex === 0
            ? "Employee created — Please complete full employee profile."
            : "Saved successfully",
        severity: "success",
      });
      // stop showing spinner
      setIsSaving(false);
      setSavingTab(null);
      // stay on page and move user to the next tab so they can continue filling forms
      if (tabIndex === 0) setActiveTab(1);
      else if (tabIndex < 3) setActiveTab(tabIndex + 1);
      else setActiveTab(3);
    } catch (err) {
      console.error("Save tab failed:", err);
      setSnackbar({
        open: true,
        message: "Save failed. See console for details.",
        severity: "error",
      });
      setIsSaving(false);
      setSavingTab(null);
    }
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
          </Box>
          {/* Snackbar for feedback */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
              severity={snackbar.severity}
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Paper>

        {/* Right column (form & tabs) */}
        <Paper sx={{ flex: 1 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => {
                // Prevent switching to other tabs until employee is created
                if (v > 0 && !employeeIdPresent) {
                  setSnackbar({
                    open: true,
                    message: "Create employee first to enable other tabs.",
                    severity: "info",
                  });
                  return;
                }
                setActiveTab(v);
              }}
              sx={{
                px: 2,
                "& .MuiTabs-indicator": { backgroundColor: COLORS.primary },
              }}
            >
              <Tab label="Personal Information" />
              <Tab label="Contact Information" disabled={!employeeIdPresent} />
              <Tab label="Employment Details" disabled={!employeeIdPresent} />
              <Tab
                label="Compensation & Payroll"
                disabled={!employeeIdPresent}
              />
            </Tabs>
          </Box>

          {/* Personal Information Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 4, color: COLORS.primary }}>
                Personal Information
              </Typography>

              <Grid container spacing={3} direction={"column"}>
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
                    <FormHelperText>{errors.gender}</FormHelperText>
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
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth || ""}
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
                    error={!!errors.nationality}
                    helperText={errors.nationality || ""}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="NIC Number"
                    placeholder="e.g. 962834153V (9 digits followed by 'V')"
                    fullWidth
                    required
                    value={form.nic}
                    onChange={handleChange("nic")}
                    error={!!errors.nic}
                    helperText={
                      errors.nic || "Enter valid National Identity Card number"
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Email Address"
                    placeholder="Enter valid email address"
                    fullWidth
                    value={form.email}
                    onChange={handleChange("email")}
                    error={!!errors.email}
                    helperText={errors.email || ""}
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
                  onClick={() => handleSaveTab(0)}
                  disabled={!isTabValid(0) || isSaving}
                  fullWidth
                  sx={{ bgcolor: COLORS.primary }}
                >
                  {isSaving && savingTab === 0 ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                  ) : null}
                  {id ? "Save Changes" : "Add Employee"}
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

              <Grid container spacing={3} direction={"column"}>
                <Grid item xs={12}>
                  <TextField
                    label="Permanent Address"
                    placeholder="Enter permanent address"
                    fullWidth
                    multiline
                    rows={2}
                    value={form.permanentAddress}
                    onChange={handleChange("permanentAddress")}
                    error={!!errors.permanentAddress}
                    helperText={errors.permanentAddress || ""}
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
                    error={!!errors.mobileNumber}
                    helperText={errors.mobileNumber || ""}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Home Telephone (optional)"
                    placeholder="e.g. +94 11 234 5678"
                    fullWidth
                    value={form.homeTelephone}
                    onChange={handleChange("homeTelephone")}
                    error={!!errors.homeTelephone}
                    helperText={errors.homeTelephone || ""}
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
                    error={!!errors.workEmail}
                    helperText={errors.workEmail || ""}
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
                    error={!!errors.personalEmail}
                    helperText={errors.personalEmail || ""}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Emergency Contact
                </Typography>
                <Grid container spacing={3} direction={"column"}>
                  <Grid item xs={4}>
                    <TextField
                      label="Name"
                      placeholder="Emergency contact full name"
                      fullWidth
                      value={form.emergencyName}
                      onChange={handleChange("emergencyName")}
                      error={!!errors.emergencyName}
                      helperText={errors.emergencyName || ""}
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
                      error={!!errors.emergencyPhone}
                      helperText={errors.emergencyPhone || ""}
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
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/hr/records")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSaveTab(1)}
                  disabled={!isTabValid(1) || isSaving}
                >
                  {isSaving && savingTab === 1 ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                  ) : null}
                  Save
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

              <Grid container spacing={3} direction={"column"}>
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
                    placeholder="e.g. Senior Lecturer"
                    fullWidth
                    value={form.jobTitle}
                    onChange={handleChange("jobTitle")}
                    error={!!errors.jobTitle}
                    helperText={errors.jobTitle || ""}
                  />
                </Grid>

                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={form.department}
                      label="Department"
                      onChange={handleChange("department")}
                    >
                      {DEPARTMENTS.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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
                    <FormHelperText>{errors.employmentType}</FormHelperText>
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
                    error={!!errors.dateOfJoining}
                    helperText={errors.dateOfJoining || ""}
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
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/hr/records")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSaveTab(2)}
                  disabled={!isTabValid(2) || isSaving}
                >
                  {isSaving && savingTab === 2 ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                  ) : null}
                  Save
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

              <Grid container spacing={3} direction={"column"}>
                <Grid item xs={6}>
                  <TextField
                    label="Basic Salary"
                    placeholder="Enter basic salary (e.g. 50000)"
                    type="number"
                    fullWidth
                    value={form.basicSalary}
                    onChange={handleChange("basicSalary")}
                    error={!!errors.basicSalary}
                    helperText={errors.basicSalary || ""}
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
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => navigate("/hr/records")}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSaveTab(3)}
                  disabled={!isTabValid(3) || isSaving}
                >
                  {isSaving && savingTab === 3 ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                      sx={{ mr: 1 }}
                    />
                  ) : null}
                  Save
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
