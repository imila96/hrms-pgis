// EmployeeProfileDto.java
package com.pgis.hrms.modules.profile.dto;

import java.time.LocalDate;

public record EmployeeProfileDto(
        Integer id,
        String email,
        String name,
        String contact,
        String address,
        String jobTitle,
        LocalDate hireDate
) {}
