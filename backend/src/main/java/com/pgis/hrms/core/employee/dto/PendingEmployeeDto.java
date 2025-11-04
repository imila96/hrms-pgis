package com.pgis.hrms.core.employee.dto;

public record PendingEmployeeDto(
    Integer employeeId,
    String email,
    String name,
    String nicNo
) {}
