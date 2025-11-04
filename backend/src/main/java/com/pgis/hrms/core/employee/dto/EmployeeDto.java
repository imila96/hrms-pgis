package com.pgis.hrms.core.employee.dto;


import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private Integer id;
    private String name;
    private String email;
    
    // New SSE-specific fields
    private String gender;
    private LocalDate dateOfBirth;
    private String nationality;
    private String nicNo;
    private String maritalStatus;
    private String religion;
    private String bloodGroup;
    private String profileImage;
}
