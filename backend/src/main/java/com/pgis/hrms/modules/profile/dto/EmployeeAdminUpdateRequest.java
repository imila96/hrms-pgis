// EmployeeAdminUpdateRequest.java (admin can edit everything)
package com.pgis.hrms.modules.profile.dto;

import java.time.LocalDate;

public record EmployeeAdminUpdateRequest(
        String name,
        String gender,
        LocalDate dateOfBirth,
        String nationality,
        String nicNo,
        String maritalStatus,
        String religion,
        String bloodGroup,
        String profileImage,
        Boolean active,      // toggle account
        Boolean verified
) {}
