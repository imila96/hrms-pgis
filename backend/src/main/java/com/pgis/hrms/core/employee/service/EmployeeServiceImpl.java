package com.pgis.hrms.core.employee.service;



import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.entity.Employment;
import com.pgis.hrms.core.employee.mapper.EmployeeMapper;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.core.employee.repository.EmploymentRepository;
import com.pgis.hrms.core.employee.dto.EmployeeDto;
import com.pgis.hrms.core.employee.dto.EmployeeSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper     employeeMapper;
    private final EmploymentRepository employmentRepository;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EmployeeDto createEmployee(EmployeeDto dto) {
        // HR creates employee WITHOUT creating a user account
        // Admin will later create user and link to this employee
        var e = employeeMapper.toEntity(dto);
        var saved = employeeRepository.save(e);
        return employeeMapper.toDto(saved);
    }

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(employeeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDto getEmployeeById(Integer id) {
        Employee e = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return employeeMapper.toDto(e);
    }

    @Override
    public EmployeeDto updateEmployee(Integer id, EmployeeDto dto) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        existing.setName(dto.getName());
        existing.setEmail(dto.getEmail());
        existing.setGender(dto.getGender());
        existing.setDateOfBirth(dto.getDateOfBirth());
        existing.setNationality(dto.getNationality());
        existing.setNicNo(dto.getNicNo());
        existing.setMaritalStatus(dto.getMaritalStatus());
        existing.setReligion(dto.getReligion());
        existing.setBloodGroup(dto.getBloodGroup());
        existing.setProfileImage(dto.getProfileImage());

        Employee updated = employeeRepository.save(existing);
        return employeeMapper.toDto(updated);
    }

    @Override
    public void deleteEmployee(Integer id) {
        employeeRepository.deleteById(id);
    }

    @Override
    public EmployeeDto getMyProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Employee emp = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return employeeMapper.toDto(emp);
    }

    @Override
    public java.util.List<EmployeeSummaryDto> getEmployeeSummaries() {
        return employeeRepository.findAll()
                .stream()
                .map(emp -> {
                    // Try to fetch the most relevant employment record. We use findFirstByEmployeeEmployeeIdOrderByDateOfJoiningAsc
                    // as a simple choice; adjust ordering if you want latest instead.
                    Employment employment = employmentRepository
                            .findFirstByEmployeeEmployeeIdOrderByDateOfJoiningAsc(emp.getEmployeeId())
                            .orElse(null);

                    String dept = employment != null ? employment.getDepartment() : null;
                    String des = employment != null ? employment.getJobTitle() : null;
                    String empType = employment != null ? employment.getEmploymentStatus() : null;
                    String stat = employment != null ? employment.getEmploymentStatus() : null;

                    return EmployeeSummaryDto.builder()
                            .employeeId(emp.getEmployeeId())
                            .name(emp.getName())
                            .email(emp.getEmail())
                            .department(dept)
                            .designation(des)
                            .employmentType(empType)
                            .status(stat)
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
    }
}