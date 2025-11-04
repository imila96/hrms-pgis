package com.pgis.hrms.core.employee.service;

import com.pgis.hrms.core.employee.dto.CompensationDto;
import com.pgis.hrms.core.employee.entity.Compensation;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.mapper.CompensationMapper;
import com.pgis.hrms.core.employee.repository.CompensationRepository;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CompensationServiceImpl implements CompensationService {

    private final CompensationRepository compensationRepository;
    private final EmployeeRepository employeeRepository;
    private final CompensationMapper compensationMapper;

    @Override
    @Transactional
    public CompensationDto createCompensation(Integer employeeId, CompensationDto dto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        
        Compensation compensation = compensationMapper.toEntity(dto, employee);
        Compensation saved = compensationRepository.save(compensation);
        return compensationMapper.toDto(saved);
    }

    @Override
    public List<CompensationDto> getAllCompensationsByEmployee(Integer employeeId) {
        return compensationRepository.findByEmployeeEmployeeId(employeeId)
                .stream()
                .map(compensationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public CompensationDto getCompensationById(Integer employeeId, Integer compensationId) {
        Compensation compensation = compensationRepository
                .findByEmployeeEmployeeIdAndCompensationId(employeeId, compensationId)
                .orElseThrow(() -> new RuntimeException("Compensation not found"));
        return compensationMapper.toDto(compensation);
    }

    @Override
    @Transactional
    public CompensationDto updateCompensation(Integer employeeId, Integer compensationId, CompensationDto dto) {
        Compensation existing = compensationRepository
                .findByEmployeeEmployeeIdAndCompensationId(employeeId, compensationId)
                .orElseThrow(() -> new RuntimeException("Compensation not found"));

        existing.setBasicSalary(dto.getBasicSalary());
        existing.setBankName(dto.getBankName());
        existing.setBranch(dto.getBranch());
        existing.setAccountNo(dto.getAccountNo());
        existing.setTin(dto.getTin());
        existing.setPensionScheme(dto.getPensionScheme());

        Compensation updated = compensationRepository.save(existing);
        return compensationMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteCompensation(Integer employeeId, Integer compensationId) {
        Compensation compensation = compensationRepository
                .findByEmployeeEmployeeIdAndCompensationId(employeeId, compensationId)
                .orElseThrow(() -> new RuntimeException("Compensation not found"));
        compensationRepository.delete(compensation);
    }
}
