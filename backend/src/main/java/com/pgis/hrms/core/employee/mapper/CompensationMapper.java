package com.pgis.hrms.core.employee.mapper;

import com.pgis.hrms.core.employee.dto.CompensationDto;
import com.pgis.hrms.core.employee.entity.Compensation;
import com.pgis.hrms.core.employee.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class CompensationMapper {

    public CompensationDto toDto(Compensation compensation) {
        if (compensation == null) return null;

        return CompensationDto.builder()
                .compensationId(compensation.getCompensationId())
                .employeeId(compensation.getEmployee() != null ? compensation.getEmployee().getEmployeeId() : null)
                .basicSalary(compensation.getBasicSalary())
                .bankName(compensation.getBankName())
                .branch(compensation.getBranch())
                .accountNo(compensation.getAccountNo())
                .tin(compensation.getTin())
                .pensionScheme(compensation.getPensionScheme())
                .build();
    }

    public Compensation toEntity(CompensationDto dto, Employee employee) {
        if (dto == null) return null;

        return Compensation.builder()
                .compensationId(dto.getCompensationId())
                .employee(employee)
                .basicSalary(dto.getBasicSalary())
                .bankName(dto.getBankName())
                .branch(dto.getBranch())
                .accountNo(dto.getAccountNo())
                .tin(dto.getTin())
                .pensionScheme(dto.getPensionScheme())
                .build();
    }
}
