import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import ProfileSidebar from "../Profile/ProfileSidebar";
import SectionTabs from "../Profile/SectionTabs";
import PersonalInfo from "../Profile/Sections/PersonalInfo";
import ContactInfo from "../Profile/Sections/ContactInfo";
import CompensationPayroll from "../Profile/Sections/CompensationPayroll";
// import axiosInstance from "../../AxiosInstance"; // uncomment when backend ready

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Static mock data
  const mockEmployees = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@corp.com",
      contact: "0701234567",
      jobTitle: "Manager",
      department: "HR",
      hireDate: "2022-01-15",
      address: "Colombo",
      salary: "LKR 120,000",
    },
    {
      id: 2,
      name: "Brian Lee",
      email: "brian@corp.com",
      contact: "0702223333",
      jobTitle: "Engineer",
      department: "IT",
      hireDate: "2023-04-10",
      address: "Galle",
      salary: "LKR 95,000",
    },
    {
      id: 3,
      name: "Carla Gomez",
      email: "carla@corp.com",
      contact: "0704445555",
      jobTitle: "Analyst",
      department: "Finance",
      hireDate: "2021-11-22",
      address: "Kandy",
      salary: "LKR 85,000",
    },
  ];

  useEffect(() => {
    setLoading(true);
    // Replace with actual API call later
    // axiosInstance.get(`/hr/employees/${id}`).then((res) => setEmployee(res.data));
    const found = mockEmployees.find((e) => e.id === Number(id));
    setTimeout(() => {
      setEmployee(found || mockEmployees[0]);
      setLoading(false);
    }, 400);
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ p: 5, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box sx={{ p: 5, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Employee not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        p: 2,
        flexWrap: { xs: "wrap", md: "nowrap" },
        backgroundColor: "#f0f1f5ff",
      }}
    >
      {/* Sidebar */}
      <ProfileSidebar
        name={employee.name}
        email={employee.email}
        role={employee.jobTitle}
        department={employee.department}
        contact={employee.contact}
        hireDate={employee.hireDate}
        address={employee.address}
      />

      {/* Main Section Tabs */}
      <Box sx={{ flexGrow: 1 }}>
        <SectionTabs
          tabs={[
            {
              label: "Personal Info",
              content: <PersonalInfo employee={employee} />,
            },
            {
              label: "Contact Info",
              content: <ContactInfo employee={employee} />,
            },
            {
              label: "Compensation & Payroll",
              content: <CompensationPayroll employee={employee} />,
            },
          ]}
        />
      </Box>
    </Box>
  );
}
