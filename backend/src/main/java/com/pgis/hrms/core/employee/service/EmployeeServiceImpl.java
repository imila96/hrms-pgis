package com.pgis.hrms.core.employee.service;



import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.mapper.EmployeeMapper;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.core.employee.dto.EmployeeDto;
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

    private final com.pgis.hrms.core.auth.repository.UserRepository userRepo;
    private final com.pgis.hrms.core.auth.repository.RoleRepository roleRepo;
    private final org.springframework.security.crypto.password.PasswordEncoder encoder;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EmployeeDto createEmployee(EmployeeDto dto) {
        // find or create a User for this email
        var user = userRepo.findByEmail(dto.getEmail()).orElseGet(() -> {
            var u = new com.pgis.hrms.core.auth.entity.User();
            u.setEmail(dto.getEmail());
            // set a temp password or your own onboarding flow
            u.setPassword(encoder.encode("Temp123!"));
            u.setAdminPasswordAssigned(false);
            return userRepo.save(u);
        });

        // ensure EMPLOYEE role
        var hasEmployee = user.getRoles().stream()
                .anyMatch(r -> "EMPLOYEE".equalsIgnoreCase(r.getCode()));
        if (!hasEmployee) {
            var employeeRole = roleRepo.findByCode("EMPLOYEE").orElseThrow();
            user.getRoles().add(employeeRole);
            userRepo.save(user);
        }

        // map and link
        var e = employeeMapper.toEntity(dto);
        e.setUser(user);          // <- REQUIRED for @MapsId
        user.setEmployee(e);      // (optional but keeps the relation consistent)

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
        existing.setContact(dto.getContact());
        existing.setJobTitle(dto.getJobTitle());
        existing.setHireDate(dto.getHireDate());
        existing.setAddress(dto.getAddress());
        if (existing.getUser() != null && dto.getEmail() != null) {
            existing.getUser().setEmail(dto.getEmail());
        }


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
        Employee emp = employeeRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        return employeeMapper.toDto(emp);
    }
}