package com.pgis.hrms.modules.Employee.service;



import com.pgis.hrms.modules.Employee.repository.EmployeeRepositoryTest;
import com.pgis.hrms.modules.Employee.dto.EmployeeDto;
import com.pgis.hrms.modules.Employee.entity.EmployeeTest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepositoryTest employeeRepository;
    private final com.pgis.hrms.modules.Employee.mapper.EmployeeMapper employeeMapper;

    @Override
    public EmployeeDto createEmployee(com.pgis.hrms.modules.Employee.dto.EmployeeDto dto) {
        EmployeeTest saved = employeeRepository.save(employeeMapper.toEntity(dto));
        return employeeMapper.toDto(saved);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getEmployeeById(Long id) {
        EmployeeTest e = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return employeeMapper.toDto(e);
    }

    @Override
    public EmployeeDto updateEmployee(Long id, EmployeeDto dto) {
        EmployeeTest existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        existing.setName(dto.getName());
        existing.setContact(dto.getContact());
        existing.setJobTitle(dto.getJobTitle());
        existing.setHireDate(dto.getHireDate());
        existing.setAddress(dto.getAddress());
        existing.setEmail(dto.getEmail());

        return employeeMapper.toDto(employeeRepository.save(existing));
    }

    @Override
    public void deleteEmployee(Long id) {
        employeeRepository.deleteById(id);
    }
}
