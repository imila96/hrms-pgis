package com.pgis.hrms.core.employee.service;




import com.pgis.hrms.core.employee.dto.EmployeeDto;
import com.pgis.hrms.core.employee.dto.EmployeeRequest;
import com.pgis.hrms.core.employee.dto.EmployeeSummaryDto;

import java.util.List;

public interface EmployeeService {
    EmployeeDto createEmployee(EmployeeDto dto);
    // New: create employee together with contact, employment and compensation in a single request
    EmployeeDto createEmployee(EmployeeRequest request);
    List<EmployeeDto> getAllEmployees();
    List<EmployeeSummaryDto> getEmployeeSummaries();
    EmployeeDto getEmployeeById(Integer id);
    EmployeeDto updateEmployee(Integer id, EmployeeDto dto);
    // New: update employee together with related sub-objects in a single transactional request
    EmployeeDto updateEmployee(Integer id, EmployeeRequest request);
    void deleteEmployee(Integer id);

    EmployeeDto getMyProfile();
}
