// ProfileUpdateRequest.java  (employee can only edit basic personal info)
package com.pgis.hrms.modules.profile.dto;

import java.time.LocalDate;

public record ProfileUpdateRequest(
        String gender,
        LocalDate dateOfBirth,
        String nationality,
        String maritalStatus,
        String religion,
        String bloodGroup,
        String profileImage
) {}
