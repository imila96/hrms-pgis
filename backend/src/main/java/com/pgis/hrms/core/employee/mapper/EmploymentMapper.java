package com.pgis.hrms.core.employee.mapper;

import com.pgis.hrms.core.employee.dto.EmploymentDto;
import com.pgis.hrms.core.employee.entity.Employment;
import com.pgis.hrms.core.employee.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class EmploymentMapper {

    public EmploymentDto toDto(Employment employment) {
        if (employment == null) return null;

        return EmploymentDto.builder()
                .employmentId(employment.getEmploymentId())
                .employeeId(employment.getEmployee() != null ? employment.getEmployee().getEmployeeId() : null)
                .jobTitle(employment.getJobTitle())
                .department(employment.getDepartment())
                .dateOfJoining(employment.getDateOfJoining())
                .probationEndDate(employment.getProbationEndDate())
                .confirmationDate(employment.getConfirmationDate())
                .dateOfRetirement(employment.getDateOfRetirement())
                .employmentStatus(employment.getEmploymentStatus())
                .build();
    }

    public Employment toEntity(EmploymentDto dto, Employee employee) {
        if (dto == null) return null;

        return Employment.builder()
                .employmentId(dto.getEmploymentId())
                .employee(employee)
                .jobTitle(dto.getJobTitle())
                .department(dto.getDepartment())
                .dateOfJoining(dto.getDateOfJoining())
                .probationEndDate(dto.getProbationEndDate())
                .confirmationDate(dto.getConfirmationDate())
                .dateOfRetirement(dto.getDateOfRetirement())
                .employmentStatus(dto.getEmploymentStatus())
                .build();
    }
}
