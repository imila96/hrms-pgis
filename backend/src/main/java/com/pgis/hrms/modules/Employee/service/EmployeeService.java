package com.pgis.hrms.modules.Employee.service;




import com.pgis.hrms.modules.Employee.dto.EmployeeDto;

import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(com.pgis.hrms.modules.Employee.dto.EmployeeDto dto);
    List<EmployeeDto> getAllEmployees();
    EmployeeDto getEmployeeById(Long id);
    EmployeeDto updateEmployee(Long id, EmployeeDto dto);
    void deleteEmployee(Long id);
}
