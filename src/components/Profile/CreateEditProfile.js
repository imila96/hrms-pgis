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
  Avatar,
  FormHelperText,
  CircularProgress,
  Snackbar,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { PhotoCamera, Delete, ArrowBack } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import WorkIcon from "@mui/icons-material/Work";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
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
  "Human Resources",
  "other",
];

function CreateEditProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeStep, setActiveStep] = useState(0);
  const [profileImage, setProfileImage] = useState(null);

  const [employeeData, setEmployeeData] = useState({
    personal: {
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
      profileImage: null,
    },
    contact: {
      permanentAddress: "",
      currentAddress: "",
      mobileNumber: "",
      homeTelephone: "",
      workEmail: "",
      personalEmail: "",
      emergencyName: "",
      emergencyRelationship: "",
      emergencyPhone: "",
    },
    employment: {
      employeeId: "",
      jobTitle: "",
      department: "",
      employmentType: "",
      dateOfJoining: "",
      probationEndDate: "",
      confirmationDate: "",
      dateOfRetirement: "",
      employmentStatus: "",
    },
    compensation: {
      basicSalary: "",
      bankName: "",
      branch: "",
      accountNo: "",
      tin: "",
      pensionScheme: "",
    },
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\+?[0-9\s-]{7,}$/;
  const nicRegex = /^\d{9}V$/;

  const steps = [
    { label: "Personal", icon: <PersonIcon /> },
    { label: "Contact", icon: <HomeIcon /> },
    { label: "Employment", icon: <WorkIcon /> },
    { label: "Compensation", icon: <AccountBalanceIcon /> },
  ];

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const empRes = await axiosInstance.get(`/hr/employees/${id}`);
        const emp = empRes.data || {};

        const contactRes = await axiosInstance.get(
          `/hr/employees/${id}/contacts`
        );
        const contacts = contactRes.data || [];
        const contact = contacts.length > 0 ? contacts[0] : {};

        const employmentRes = await axiosInstance.get(
          `/hr/employees/${id}/employments`
        );
        const emps = employmentRes.data || [];
        const employment = emps.length > 0 ? emps[0] : {};

        const compRes = await axiosInstance.get(
          `/hr/employees/${id}/compensations`
        );
        const comps = compRes.data || [];
        const compensation = comps.length > 0 ? comps[0] : {};

        if (!mounted) return;

        setEmployeeData({
          personal: {
            firstName: emp.name ? emp.name.split(" ")[0] : "",
            lastName: emp.name ? emp.name.split(" ").slice(1).join(" ") : "",
            gender: emp.gender || "",
            dateOfBirth: emp.dateOfBirth || "",
            nationality: emp.nationality || "",
            nic: emp.nicNo || "",
            maritalStatus: emp.maritalStatus || "",
            religion: emp.religion || "",
            bloodGroup: emp.bloodGroup || "",
            email: emp.email || "",
            phone: "",
            address: "",
            profileImage: emp.profileImage || null,
          },
          contact: {
            permanentAddress: contact.permanentAddress || "",
            currentAddress: contact.currentAddress || "",
            mobileNumber: contact.mobileNumber || "",
            homeTelephone: contact.homeTelephone || "",
            workEmail: contact.workEmail || emp.email || "",
            personalEmail: contact.personalEmail || "",
            emergencyName: contact.emergencyName || "",
            emergencyRelationship: contact.emergencyRelationship || "",
            emergencyPhone: contact.emergencyPhone || "",
          },
          employment: {
            employeeId: employment.employeeId || id,
            jobTitle: employment.jobTitle || "",
            department: employment.department || "",
            employmentType: employment.employmentStatus || "",
            dateOfJoining: employment.dateOfJoining || "",
            probationEndDate: employment.probationEndDate || "",
            confirmationDate: employment.confirmationDate || "",
            dateOfRetirement: employment.dateOfRetirement || "",
            employmentStatus: employment.employmentStatus || "",
          },
          compensation: {
            basicSalary: compensation.basicSalary || "",
            bankName: compensation.bankName || "",
            branch: compensation.branch || "",
            accountNo: compensation.accountNo || "",
            tin: compensation.tin || "",
            pensionScheme: compensation.pensionScheme || "",
          },
        });

        if (emp.profileImage) setProfileImage(emp.profileImage);
      } catch (err) {
        console.error("Failed to load employee details", err);
      }
    })();
    return () => (mounted = false);
  }, [id]);

  const setField = (section, field, value) => {
    setEmployeeData((s) => ({
      ...s,
      [section]: { ...s[section], [field]: value },
    }));
  };

  const validateStep = (step) => {
    const errs = {};
    if (step === 0) {
      const p = employeeData.personal;
      if (!p.firstName || !String(p.firstName).trim())
        errs.firstName = "Required";
      if (!p.lastName || !String(p.lastName).trim()) errs.lastName = "Required";
      if (!p.gender) errs.gender = "Required";
      if (!p.dateOfBirth) errs.dateOfBirth = "Required";
      if (!p.nationality || !String(p.nationality).trim())
        errs.nationality = "Required";
      // Email is required for creating an employee
      if (!p.email || !emailRegex.test(p.email))
        errs.email = "Required / Invalid";
      if (p.nic && !nicRegex.test(String(p.nic))) errs.nic = "Invalid NIC";
    }
    if (step === 1) {
      const c = employeeData.contact;
      if (!c.permanentAddress || !String(c.permanentAddress).trim())
        errs.permanentAddress = "Required";
      // mobile number is required per request
      if (!c.mobileNumber || !phoneRegex.test(c.mobileNumber))
        errs.mobileNumber = "Required / Invalid";
      if (c.workEmail && !emailRegex.test(c.workEmail))
        errs.workEmail = "Invalid";
      if (c.personalEmail && !emailRegex.test(c.personalEmail))
        errs.personalEmail = "Invalid";
      if (!c.emergencyName || !String(c.emergencyName).trim())
        errs.emergencyName = "Required";
      if (!c.emergencyRelationship || !String(c.emergencyRelationship).trim())
        errs.emergencyRelationship = "Required";
      if (!c.emergencyPhone || !phoneRegex.test(c.emergencyPhone))
        errs.emergencyPhone = "Required / Invalid";
    }
    if (step === 2) {
      const e = employeeData.employment;
      if (!e.jobTitle || !String(e.jobTitle).trim()) errs.jobTitle = "Required";
      if (!e.department || !String(e.department).trim())
        errs.department = "Required";
      if (!e.dateOfJoining) errs.dateOfJoining = "Required";
      if (!e.employmentStatus || !String(e.employmentStatus).trim())
        errs.employmentStatus = "Required";

      // if dateOfJoining present, ensure other employment dates (if provided) are after it
      const doj = e.dateOfJoining ? new Date(e.dateOfJoining) : null;
      if (doj) {
        if (e.probationEndDate) {
          const pd = new Date(e.probationEndDate);
          if (isNaN(pd.getTime()) || pd <= doj)
            errs.probationEndDate = "Must be after Date of Joining";
        }
        if (e.confirmationDate) {
          const cd = new Date(e.confirmationDate);
          if (isNaN(cd.getTime()) || cd <= doj)
            errs.confirmationDate = "Must be after Date of Joining";
        }
        if (e.dateOfRetirement) {
          const rd = new Date(e.dateOfRetirement);
          if (isNaN(rd.getTime()) || rd <= doj)
            errs.dateOfRetirement = "Must be after Date of Joining";
        }
      }
    }
    if (step === 3) {
      const c = employeeData.compensation;
      if (c.basicSalary === "" || c.basicSalary == null)
        errs.basicSalary = "Required";
      else if (isNaN(Number(c.basicSalary)) || Number(c.basicSalary) <= 0)
        errs.basicSalary = "Must be a positive number";
      if (c.accountNo && !/^[0-9]+$/.test(String(c.accountNo)))
        errs.accountNo = "Numbers only";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(activeStep)) return;
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => Math.max(0, s - 1));

  const handleImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfileImage(ev.target.result);
      setField("personal", "profileImage", ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setField("personal", "profileImage", null);
  };

  const buildPayload = () => ({
    employee: {
      name: `${employeeData.personal.firstName || ""}${
        employeeData.personal.lastName
          ? " " + employeeData.personal.lastName
          : ""
      }`,
      email: employeeData.personal.email || null,
      gender: employeeData.personal.gender || null,
      dateOfBirth: employeeData.personal.dateOfBirth || null,
      nationality: employeeData.personal.nationality || null,
      nicNo: employeeData.personal.nic || null,
      maritalStatus: employeeData.personal.maritalStatus || null,
      religion: employeeData.personal.religion || null,
      bloodGroup: employeeData.personal.bloodGroup || null,
      profileImage: employeeData.personal.profileImage || null,
    },
    contact: {
      permanentAddress: employeeData.contact.permanentAddress || null,
      currentAddress: employeeData.contact.currentAddress || null,
      mobileNumber: employeeData.contact.mobileNumber || null,
      homeTelephone: employeeData.contact.homeTelephone || null,
      workEmail: employeeData.contact.workEmail || null,
      personalEmail: employeeData.contact.personalEmail || null,
      emergencyName: employeeData.contact.emergencyName || null,
      emergencyRelationship: employeeData.contact.emergencyRelationship || null,
      emergencyPhone: employeeData.contact.emergencyPhone || null,
    },
    employment: {
      jobTitle: employeeData.employment.jobTitle || null,
      department: employeeData.employment.department || null,
      dateOfJoining: employeeData.employment.dateOfJoining || null,
      probationEndDate: employeeData.employment.probationEndDate || null,
      confirmationDate: employeeData.employment.confirmationDate || null,
      dateOfRetirement: employeeData.employment.dateOfRetirement || null,
      employmentStatus: employeeData.employment.employmentStatus || null,
    },
    compensation: {
      basicSalary: employeeData.compensation.basicSalary || null,
      bankName: employeeData.compensation.bankName || null,
      branch: employeeData.compensation.branch || null,
      accountNo: employeeData.compensation.accountNo || null,
      tin: employeeData.compensation.tin || null,
      pensionScheme: employeeData.compensation.pensionScheme || null,
    },
  });

  const handleSubmit = async () => {
    // validate all steps before submit
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        setActiveStep(i);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      if (id) {
        await axiosInstance.put(`/hr/employees/${id}/full`, payload);
      } else {
        await axiosInstance.post(`/hr/employees/create`, payload);
      }
      setSnackbar({
        open: true,
        message: "Saved successfully",
        severity: "success",
      });
      // redirect to records
      navigate("/hr/records");
    } catch (err) {
      console.error("Save failed", err);
      setSnackbar({ open: true, message: "Save failed", severity: "error" });
    } finally {
      setIsSubmitting(false);
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

        <Paper sx={{ flex: 1, p: 2 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((s, idx) => {
              // clone the icon so we can apply sx props dynamically based on active step
              const icon = React.cloneElement(s.icon, {
                sx: {
                  color:
                    idx === activeStep ? COLORS.primary : "rgba(0,0,0,0.45)",
                  fontSize: 28,
                },
              });

              return (
                <Step key={s.label}>
                  <StepLabel
                    icon={icon}
                    sx={{
                      "& .MuiStepLabel-label": {
                        color: idx === activeStep ? COLORS.primary : undefined,
                      },
                    }}
                  >
                    {s.label}
                  </StepLabel>
                </Step>
              );
            })}
          </Stepper>

          <Box sx={{ p: 2 }}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                  Personal Information
                </Typography>
                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          First Name <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="e.g. John"
                      value={employeeData.personal.firstName}
                      onChange={(e) =>
                        setField("personal", "firstName", e.target.value)
                      }
                      fullWidth
                      required
                      error={!!errors.firstName}
                      helperText={errors.firstName || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Last Name <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="e.g. Doe"
                      value={employeeData.personal.lastName}
                      onChange={(e) =>
                        setField("personal", "lastName", e.target.value)
                      }
                      fullWidth
                      required
                      error={!!errors.lastName}
                      helperText={errors.lastName || ""}
                    />
                  </Grid>
                  <Grid item>
                    <FormControl fullWidth required>
                      <InputLabel>
                        <span>
                          Gender <span style={{ color: "red" }}>*</span>
                        </span>
                      </InputLabel>
                      <Select
                        value={employeeData.personal.gender}
                        label={
                          <span>
                            Gender <span style={{ color: "red" }}>*</span>
                          </span>
                        }
                        onChange={(e) =>
                          setField("personal", "gender", e.target.value)
                        }
                      >
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                        <MenuItem value="other">Other</MenuItem>
                      </Select>
                      <FormHelperText>{errors.gender}</FormHelperText>
                    </FormControl>
                  </Grid>
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Date of Birth <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      type="date"
                      placeholder="YYYY-MM-DD"
                      fullWidth
                      value={employeeData.personal.dateOfBirth}
                      onChange={(e) =>
                        setField("personal", "dateOfBirth", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfBirth}
                      helperText={errors.dateOfBirth || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Nationality <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      fullWidth
                      placeholder="e.g. Sri Lankan"
                      value={employeeData.personal.nationality}
                      onChange={(e) =>
                        setField("personal", "nationality", e.target.value)
                      }
                      error={!!errors.nationality}
                      helperText={errors.nationality || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          NIC Number <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      fullWidth
                      placeholder="e.g. 962834153V"
                      value={employeeData.personal.nic}
                      onChange={(e) =>
                        setField("personal", "nic", e.target.value)
                      }
                      error={!!errors.nic}
                      helperText={errors.nic || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Email <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      fullWidth
                      placeholder="e.g. name@example.com"
                      value={employeeData.personal.email}
                      onChange={(e) =>
                        setField("personal", "email", e.target.value)
                      }
                      error={!!errors.email}
                      helperText={errors.email || ""}
                    />
                  </Grid>

                  <Grid item>
                    <FormControl fullWidth>
                      <InputLabel>Marital Status</InputLabel>
                      <Select
                        value={employeeData.personal.maritalStatus}
                        label="Marital Status"
                        onChange={(e) =>
                          setField("personal", "maritalStatus", e.target.value)
                        }
                      >
                        {MARITAL_STATUS.map((s) => (
                          <MenuItem key={s} value={s.toLowerCase()}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item>
                    <FormControl fullWidth>
                      <InputLabel>Religion</InputLabel>
                      <Select
                        value={employeeData.personal.religion}
                        label="Religion"
                        onChange={(e) =>
                          setField("personal", "religion", e.target.value)
                        }
                      >
                        {RELIGIONS.map((r) => (
                          <MenuItem key={r} value={r.toLowerCase()}>
                            {r}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item>
                    <FormControl fullWidth>
                      <InputLabel>Blood Group</InputLabel>
                      <Select
                        value={employeeData.personal.bloodGroup}
                        label="Blood Group"
                        onChange={(e) =>
                          setField("personal", "bloodGroup", e.target.value)
                        }
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
              </Box>
            )}

            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                  Contact Information
                </Typography>
                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Permanent Address{" "}
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      multiline
                      rows={2}
                      fullWidth
                      value={employeeData.contact.permanentAddress}
                      onChange={(e) =>
                        setField("contact", "permanentAddress", e.target.value)
                      }
                      error={!!errors.permanentAddress}
                      helperText={errors.permanentAddress || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Current Address"
                      placeholder="e.g. 123, Flower Rd, Colombo"
                      multiline
                      rows={2}
                      fullWidth
                      value={employeeData.contact.currentAddress}
                      onChange={(e) =>
                        setField("contact", "currentAddress", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Mobile Number <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="+94 77 123 4567"
                      fullWidth
                      value={employeeData.contact.mobileNumber}
                      onChange={(e) =>
                        setField("contact", "mobileNumber", e.target.value)
                      }
                      error={!!errors.mobileNumber}
                      helperText={errors.mobileNumber || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Work Email"
                      placeholder="e.g. name@company.com"
                      fullWidth
                      value={employeeData.contact.workEmail}
                      onChange={(e) =>
                        setField("contact", "workEmail", e.target.value)
                      }
                      error={!!errors.workEmail}
                      helperText={errors.workEmail || ""}
                    />
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      Emergency Contact
                    </Typography>
                    <TextField
                      label={
                        <span>
                          {" "}
                          Name <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="e.g. Jane Doe"
                      fullWidth
                      value={employeeData.contact.emergencyName}
                      onChange={(e) =>
                        setField("contact", "emergencyName", e.target.value)
                      }
                      error={!!errors.emergencyName}
                      helperText={errors.emergencyName || ""}
                      sx={{ mt: 1 }}
                    />

                    <TextField
                      label={
                        <span>
                          {" "}
                          Relationship <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="e.g. Spouse"
                      fullWidth
                      value={employeeData.contact.emergencyRelationship}
                      onChange={(e) =>
                        setField(
                          "contact",
                          "emergencyRelationship",
                          e.target.value
                        )
                      }
                      error={!!errors.emergencyRelationship}
                      helperText={errors.emergencyRelationship || ""}
                      sx={{ mt: 1 }}
                    />

                    <TextField
                      label={
                        <span>
                          {" "}
                          Phone <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="+94 77 123 4567"
                      fullWidth
                      value={employeeData.contact.emergencyPhone}
                      onChange={(e) =>
                        setField("contact", "emergencyPhone", e.target.value)
                      }
                      error={!!errors.emergencyPhone}
                      helperText={errors.emergencyPhone || ""}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                  Employment Details
                </Typography>
                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Job Title <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="e.g. Senior Lecturer"
                      fullWidth
                      value={employeeData.employment.jobTitle}
                      onChange={(e) =>
                        setField("employment", "jobTitle", e.target.value)
                      }
                      error={!!errors.jobTitle}
                      helperText={errors.jobTitle || ""}
                    />
                  </Grid>

                  <Grid item>
                    <FormControl fullWidth>
                      <InputLabel>
                        Department <span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <Select
                        value={employeeData.employment.department}
                        label="Department"
                        onChange={(e) =>
                          setField("employment", "department", e.target.value)
                        }
                      >
                        {DEPARTMENTS.map((d) => (
                          <MenuItem key={d} value={d}>
                            {d}
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>{errors.department}</FormHelperText>
                    </FormControl>
                  </Grid>

                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Date of Joining{" "}
                          <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      type="date"
                      placeholder="YYYY-MM-DD"
                      fullWidth
                      value={employeeData.employment.dateOfJoining}
                      onChange={(e) =>
                        setField("employment", "dateOfJoining", e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfJoining}
                      helperText={errors.dateOfJoining || ""}
                    />
                  </Grid>

                  <Grid item>
                    <TextField
                      label="Probation End Date"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      fullWidth
                      value={employeeData.employment.probationEndDate}
                      onChange={(e) =>
                        setField(
                          "employment",
                          "probationEndDate",
                          e.target.value
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.probationEndDate}
                      helperText={errors.probationEndDate || ""}
                    />
                  </Grid>

                  <Grid item>
                    <TextField
                      label="Confirmation Date"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      fullWidth
                      value={employeeData.employment.confirmationDate}
                      onChange={(e) =>
                        setField(
                          "employment",
                          "confirmationDate",
                          e.target.value
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.confirmationDate}
                      helperText={errors.confirmationDate || ""}
                    />
                  </Grid>

                  <Grid item>
                    <TextField
                      label="Date of Retirement"
                      type="date"
                      placeholder="YYYY-MM-DD"
                      fullWidth
                      value={employeeData.employment.dateOfRetirement}
                      onChange={(e) =>
                        setField(
                          "employment",
                          "dateOfRetirement",
                          e.target.value
                        )
                      }
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.dateOfRetirement}
                      helperText={errors.dateOfRetirement || ""}
                    />
                  </Grid>

                  <Grid item>
                    <FormControl fullWidth>
                      <InputLabel>
                        Employment Status{" "}
                        <span style={{ color: "red" }}>*</span>
                      </InputLabel>
                      <Select
                        value={employeeData.employment.employmentStatus}
                        label="Employment Status"
                        onChange={(e) =>
                          setField(
                            "employment",
                            "employmentStatus",
                            e.target.value
                          )
                        }
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="on_leave">On Leave</MenuItem>
                        <MenuItem value="terminated">Terminated</MenuItem>
                        <MenuItem value="retired">Retired</MenuItem>
                      </Select>
                      <FormHelperText>{errors.employmentStatus}</FormHelperText>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            )}

            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: COLORS.primary }}>
                  Compensation & Payroll
                </Typography>
                <Grid container spacing={2} direction="column">
                  <Grid item>
                    <TextField
                      label={
                        <span>
                          Basic Salary <span style={{ color: "red" }}>*</span>
                        </span>
                      }
                      placeholder="50000"
                      type="number"
                      fullWidth
                      required
                      value={employeeData.compensation.basicSalary}
                      onChange={(e) =>
                        setField("compensation", "basicSalary", e.target.value)
                      }
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      error={!!errors.basicSalary}
                      helperText={errors.basicSalary || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Bank Name"
                      placeholder="e.g. National Bank"
                      fullWidth
                      value={employeeData.compensation.bankName}
                      onChange={(e) =>
                        setField("compensation", "bankName", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Account Number"
                      placeholder="Numbers only, e.g. 1234567890"
                      fullWidth
                      value={employeeData.compensation.accountNo}
                      onChange={(e) =>
                        setField("compensation", "accountNo", e.target.value)
                      }
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      error={!!errors.accountNo}
                      helperText={errors.accountNo || ""}
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Tax Identification No (TIN)"
                      placeholder="e.g. 123456789V"
                      fullWidth
                      value={employeeData.compensation.tin}
                      onChange={(e) =>
                        setField("compensation", "tin", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item>
                    <TextField
                      label="Pension Scheme"
                      placeholder="e.g. Contributory"
                      fullWidth
                      value={employeeData.compensation.pensionScheme}
                      onChange={(e) =>
                        setField(
                          "compensation",
                          "pensionScheme",
                          e.target.value
                        )
                      }
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/hr/records")}
              >
                Cancel
              </Button>
              <Box sx={{ display: "flex", gap: 1 }}>
                {activeStep > 0 && (
                  <Button variant="outlined" onClick={handleBack}>
                    Back
                  </Button>
                )}
                {activeStep < steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ bgcolor: COLORS.primary }}
                  >
                    Next
                  </Button>
                )}
                {activeStep === steps.length - 1 && (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    sx={{ bgcolor: COLORS.primary }}
                  >
                    {isSubmitting ? (
                      <CircularProgress
                        size={18}
                        color="inherit"
                        sx={{ mr: 1 }}
                      />
                    ) : null}
                    Finish
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default CreateEditProfile;
