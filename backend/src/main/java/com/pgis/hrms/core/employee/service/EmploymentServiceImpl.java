package com.pgis.hrms.core.employee.service;

import com.pgis.hrms.core.employee.dto.EmploymentDto;
import com.pgis.hrms.core.employee.entity.Employment;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.mapper.EmploymentMapper;
import com.pgis.hrms.core.employee.repository.EmploymentRepository;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmploymentServiceImpl implements EmploymentService {

    private final EmploymentRepository employmentRepository;
    private final EmployeeRepository employeeRepository;
    private final EmploymentMapper employmentMapper;

    @Override
    @Transactional
    public EmploymentDto createEmployment(Integer employeeId, EmploymentDto dto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        
        Employment employment = employmentMapper.toEntity(dto, employee);
        Employment saved = employmentRepository.save(employment);
        return employmentMapper.toDto(saved);
    }

    @Override
    public List<EmploymentDto> getAllEmploymentsByEmployee(Integer employeeId) {
        return employmentRepository.findByEmployeeEmployeeId(employeeId)
                .stream()
                .map(employmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmploymentDto getEmploymentById(Integer employeeId, Integer employmentId) {
        Employment employment = employmentRepository
                .findByEmployeeEmployeeIdAndEmploymentId(employeeId, employmentId)
                .orElseThrow(() -> new RuntimeException("Employment not found"));
        return employmentMapper.toDto(employment);
    }

    @Override
    @Transactional
    public EmploymentDto updateEmployment(Integer employeeId, Integer employmentId, EmploymentDto dto) {
        Employment existing = employmentRepository
                .findByEmployeeEmployeeIdAndEmploymentId(employeeId, employmentId)
                .orElseThrow(() -> new RuntimeException("Employment not found"));

        existing.setJobTitle(dto.getJobTitle());
        existing.setDepartment(dto.getDepartment());
        existing.setDateOfJoining(dto.getDateOfJoining());
        existing.setProbationEndDate(dto.getProbationEndDate());
        existing.setConfirmationDate(dto.getConfirmationDate());
        existing.setDateOfRetirement(dto.getDateOfRetirement());
        existing.setEmploymentStatus(dto.getEmploymentStatus());

        Employment updated = employmentRepository.save(existing);
        return employmentMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteEmployment(Integer employeeId, Integer employmentId) {
        Employment employment = employmentRepository
                .findByEmployeeEmployeeIdAndEmploymentId(employeeId, employmentId)
                .orElseThrow(() -> new RuntimeException("Employment not found"));
        employmentRepository.delete(employment);
    }
}
