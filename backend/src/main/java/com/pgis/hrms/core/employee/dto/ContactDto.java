package com.pgis.hrms.core.employee.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactDto {
    private Integer contactId;
    private Integer employeeId;
    private String permanentAddress;
    private String currentAddress;
    private String mobileNumber;
    private String homeTelephone;
    private String workEmail;
    private String personalEmail;
    private String emergencyName;
    private String emergencyRelationship;
    private String emergencyPhone;
}
