package com.pgis.hrms.core.employee.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRequest {
    private EmployeeDto employee;
    private ContactDto contact;
    private EmploymentDto employment;
    private CompensationDto compensation;
}
