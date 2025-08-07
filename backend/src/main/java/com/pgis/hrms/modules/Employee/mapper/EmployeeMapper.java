package com.pgis.hrms.modules.Employee.mapper;

import com.pgis.hrms.modules.Employee.dto.EmployeeDto;
import com.pgis.hrms.modules.Employee.entity.EmployeeTest;
import org.springframework.stereotype.Component;

@Component
public class EmployeeMapper {

    public com.pgis.hrms.modules.Employee.dto.EmployeeDto toDto(EmployeeTest e) {
        if (e == null) return null;

        return com.pgis.hrms.modules.Employee.dto.EmployeeDto.builder()
                .id(e.getId())
                .name(e.getName())
                .contact(e.getContact())
                .jobTitle(e.getJobTitle())
                .hireDate(e.getHireDate())
                .address(e.getAddress())
                .email(e.getEmail())
                .build();
    }

    public EmployeeTest toEntity(EmployeeDto dto) {
        if (dto == null) return null;

        return EmployeeTest.builder()
                .id(dto.getId())
                .name(dto.getName())
                .contact(dto.getContact())
                .jobTitle(dto.getJobTitle())
                .hireDate(dto.getHireDate())
                .address(dto.getAddress())
                .email(dto.getEmail())
                .build();
    }
}
