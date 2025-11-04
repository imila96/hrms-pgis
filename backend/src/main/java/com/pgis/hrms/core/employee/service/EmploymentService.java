package com.pgis.hrms.core.employee.service;

import com.pgis.hrms.core.employee.dto.EmploymentDto;

import java.util.List;

public interface EmploymentService {
    
    EmploymentDto createEmployment(Integer employeeId, EmploymentDto dto);
    
    List<EmploymentDto> getAllEmploymentsByEmployee(Integer employeeId);
    
    EmploymentDto getEmploymentById(Integer employeeId, Integer employmentId);
    
    EmploymentDto updateEmployment(Integer employeeId, Integer employmentId, EmploymentDto dto);
    
    void deleteEmployment(Integer employeeId, Integer employmentId);
}
