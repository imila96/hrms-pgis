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
                .email(e.getEmail())
                .gender(e.getGender())
                .dateOfBirth(e.getDateOfBirth())
                .nationality(e.getNationality())
                .nicNo(e.getNicNo())
                .maritalStatus(e.getMaritalStatus())
                .religion(e.getReligion())
                .bloodGroup(e.getBloodGroup())
                .profileImage(e.getProfileImage())
                .build();
    }

    public Employee toEntity(EmployeeDto dto) {
        if (dto == null) return null;

        return Employee.builder()
                .employeeId(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .gender(dto.getGender())
                .dateOfBirth(dto.getDateOfBirth())
                .nationality(dto.getNationality())
                .nicNo(dto.getNicNo())
                .maritalStatus(dto.getMaritalStatus())
                .religion(dto.getReligion())
                .bloodGroup(dto.getBloodGroup())
                .profileImage(dto.getProfileImage())
                .build();
    }
}
