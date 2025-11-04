// EmployeeProfileDto.java
package com.pgis.hrms.modules.profile.dto;

import java.time.LocalDate;

public record EmployeeProfileDto(
        Integer id,
        String email,
        String name,
        String gender,
        LocalDate dateOfBirth,
        String nationality,
        String nicNo,
        String maritalStatus,
        String religion,
        String bloodGroup,
        String profileImage
) {}
