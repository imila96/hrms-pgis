package com.pgis.hrms.core.employee.service;

import com.pgis.hrms.core.employee.dto.CompensationDto;

import java.util.List;

public interface CompensationService {
    
    CompensationDto createCompensation(Integer employeeId, CompensationDto dto);
    
    List<CompensationDto> getAllCompensationsByEmployee(Integer employeeId);
    
    CompensationDto getCompensationById(Integer employeeId, Integer compensationId);
    
    CompensationDto updateCompensation(Integer employeeId, Integer compensationId, CompensationDto dto);
    
    void deleteCompensation(Integer employeeId, Integer compensationId);
}
