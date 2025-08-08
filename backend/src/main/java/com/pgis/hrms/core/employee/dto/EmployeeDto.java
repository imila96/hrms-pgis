package com.pgis.hrms.core.employee.dto;


import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeDto {
    private Integer id;
    private String name;
    private String contact;
    private String jobTitle;
    private LocalDate hireDate;
    private String address;
    private String email;
}
