// EmployeeAdminUpdateRequest.java (admin can edit everything)
package com.pgis.hrms.modules.profile.dto;

import java.time.LocalDate;

public record EmployeeAdminUpdateRequest(
        String name,
        String contact,
        String address,
        String jobTitle,
        LocalDate hireDate,
        Boolean active,      // toggle account
        Boolean verified
) {}
