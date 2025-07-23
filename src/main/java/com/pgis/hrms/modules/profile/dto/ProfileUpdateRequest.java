// ProfileUpdateRequest.java  (employee can only edit contact + address)
package com.pgis.hrms.modules.profile.dto;

public record ProfileUpdateRequest(
        String contact,
        String address
) {}
