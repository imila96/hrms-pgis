package com.pgis.hrms.core.auth.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

/**
 * Sent by ADMIN to create an employee account.
 */
public record CreateEmployeeRequest(
        @Email            String  email,
        @Size(min = 6)    String  password,
        String            name,
        String            jobTitle,
        String            contact
) {}
