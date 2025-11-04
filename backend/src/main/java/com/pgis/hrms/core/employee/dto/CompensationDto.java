package com.pgis.hrms.core.employee.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompensationDto {
    private Integer compensationId;
    private Integer employeeId;
    private BigDecimal basicSalary;
    private String bankName;
    private String branch;
    private String accountNo;
    private String tin;
    private String pensionScheme;
}
