package com.pgis.hrms.core.employee.mapper;

import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.dto.EmployeeDto;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public EmployeeDto toDto(Employee e) {
        if (e == null) return null;

        return EmployeeDto.builder()
                .id(e.getEmployeeId())
                .name(e.getName())
                .contact(e.getContact())
                .jobTitle(e.getJobTitle())
                .hireDate(e.getHireDate())
                .address(e.getAddress())
                .email(e.getEmail())
                .build();
    }

    public Employee toEntity(EmployeeDto dto) {
        if (dto == null) return null;

        return Employee.builder()
                .employeeId(dto.getId())
                .name(dto.getName())
                .contact(dto.getContact())
                .jobTitle(dto.getJobTitle())
                .hireDate(dto.getHireDate())
                .address(dto.getAddress())
                .email(dto.getEmail())
                .build();
    }
}
