package com.pgis.hrms.core.employee.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight DTO used for listing/summary views in the UI.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeSummaryDto {
    private Integer employeeId;
    private String name;
    private String email;
    private String department;
    private String designation;
    private String employmentType;
    private String status;
}
