package com.pgis.hrms.core.employee.dto;

import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmploymentDto {
    private Integer employmentId;
    private Integer employeeId;
    private String jobTitle;
    private String department;
    private LocalDate dateOfJoining;
    private LocalDate probationEndDate;
    private LocalDate confirmationDate;
    private LocalDate dateOfRetirement;
    private String employmentStatus;
    private String employmentType;
}
