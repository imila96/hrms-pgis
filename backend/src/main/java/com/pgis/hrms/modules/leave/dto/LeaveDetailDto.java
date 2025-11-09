package com.pgis.hrms.modules.leave.dto;

import com.pgis.hrms.modules.leave.model.LeaveStatus;
import com.pgis.hrms.modules.leave.model.LeaveType;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record LeaveDetailDto(
        Integer id,
        String employeeName,
        String employeeId,
        String department,
        LeaveType type,
        LocalDate start,
        LocalDate end,
        LeaveStatus status,
        String reason,
        LocalDateTime requestedAt,
        boolean hasMedicalCertificate,
        String medicalCertificateFilename
) {}
