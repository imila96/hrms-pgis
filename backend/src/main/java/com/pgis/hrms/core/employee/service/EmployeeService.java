package com.pgis.hrms.core.employee.service;




import com.pgis.hrms.core.employee.dto.EmployeeDto;

import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto dto);
    List<EmployeeDto> getAllEmployees();
    EmployeeDto getEmployeeById(Integer id);
    EmployeeDto updateEmployee(Integer id, EmployeeDto dto);
    void deleteEmployee(Integer id);

    EmployeeDto getMyProfile();
}
