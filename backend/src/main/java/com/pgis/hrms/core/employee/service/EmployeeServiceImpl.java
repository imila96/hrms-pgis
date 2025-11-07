package com.pgis.hrms.core.employee.service;



import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.entity.Employment;
import com.pgis.hrms.core.employee.mapper.EmployeeMapper;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.core.employee.repository.EmploymentRepository;
import com.pgis.hrms.core.employee.dto.EmployeeDto;
import com.pgis.hrms.core.employee.dto.EmployeeSummaryDto;
import com.pgis.hrms.core.employee.dto.EmployeeRequest;
import com.pgis.hrms.core.employee.dto.ContactDto;
import com.pgis.hrms.core.employee.dto.EmploymentDto;
import com.pgis.hrms.core.employee.dto.CompensationDto;
import com.pgis.hrms.core.employee.repository.ContactRepository;
import com.pgis.hrms.core.employee.repository.CompensationRepository;
import com.pgis.hrms.core.employee.mapper.ContactMapper;
import com.pgis.hrms.core.employee.mapper.EmploymentMapper;
import com.pgis.hrms.core.employee.mapper.CompensationMapper;
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
    private final ContactRepository contactRepository;
    private final CompensationRepository compensationRepository;
    private final ContactMapper contactMapper;
    private final EmploymentMapper employmentMapper;
    private final CompensationMapper compensationMapper;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EmployeeDto createEmployee(EmployeeDto dto) {
        // existing simple create behaviour preserved
        var e = employeeMapper.toEntity(dto);
        var saved = employeeRepository.save(e);
        return employeeMapper.toDto(saved);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public EmployeeDto createEmployee(EmployeeRequest request) {
        // Create employee entity
        var empDto = request.getEmployee();
        var empEntity = employeeMapper.toEntity(empDto == null ? new EmployeeDto() : empDto);
        var savedEmp = employeeRepository.save(empEntity);

        Integer empId = savedEmp.getEmployeeId();

        // contact
        ContactDto contactDto = request.getContact();
        if (contactDto != null) {
            var contactEntity = contactMapper.toEntity(contactDto, savedEmp);
            contactRepository.save(contactEntity);
        }

        // employment
        EmploymentDto employmentDto = request.getEmployment();
        if (employmentDto != null) {
            var employmentEntity = employmentMapper.toEntity(employmentDto, savedEmp);
            employmentRepository.save(employmentEntity);
        }

        // compensation
        CompensationDto compensationDto = request.getCompensation();
        if (compensationDto != null) {
            var compEntity = compensationMapper.toEntity(compensationDto, savedEmp);
            compensationRepository.save(compEntity);
        }

        return employeeMapper.toDto(savedEmp);
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
    @org.springframework.transaction.annotation.Transactional
    public EmployeeDto updateEmployee(Integer id, EmployeeRequest request) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        var empDto = request.getEmployee();
        if (empDto != null) {
            existing.setName(empDto.getName());
            existing.setEmail(empDto.getEmail());
            existing.setGender(empDto.getGender());
            existing.setDateOfBirth(empDto.getDateOfBirth());
            existing.setNationality(empDto.getNationality());
            existing.setNicNo(empDto.getNicNo());
            existing.setMaritalStatus(empDto.getMaritalStatus());
            existing.setReligion(empDto.getReligion());
            existing.setBloodGroup(empDto.getBloodGroup());
            existing.setProfileImage(empDto.getProfileImage());
        }

        Employee saved = employeeRepository.save(existing);

        // update or create contact
        ContactDto contactDto = request.getContact();
        if (contactDto != null) {
            var contacts = contactRepository.findByEmployeeEmployeeId(id);
            if (!contacts.isEmpty()) {
                var c = contacts.get(0);
                var newC = contactMapper.toEntity(contactDto, saved);
                newC.setContactId(c.getContactId());
                contactRepository.save(newC);
            } else {
                var newC = contactMapper.toEntity(contactDto, saved);
                contactRepository.save(newC);
            }
        }

        // update or create employment
        EmploymentDto employmentDto = request.getEmployment();
        if (employmentDto != null) {
            var emps = employmentRepository.findByEmployeeEmployeeId(id);
            if (!emps.isEmpty()) {
                var e = emps.get(0);
                var newE = employmentMapper.toEntity(employmentDto, saved);
                newE.setEmploymentId(e.getEmploymentId());
                employmentRepository.save(newE);
            } else {
                var newE = employmentMapper.toEntity(employmentDto, saved);
                employmentRepository.save(newE);
            }
        }

        // update or create compensation
        CompensationDto compDto = request.getCompensation();
        if (compDto != null) {
            var comps = compensationRepository.findByEmployeeEmployeeId(id);
            if (!comps.isEmpty()) {
                var c = comps.get(0);
                var newC = compensationMapper.toEntity(compDto, saved);
                newC.setCompensationId(c.getCompensationId());
                compensationRepository.save(newC);
            } else {
                var newC = compensationMapper.toEntity(compDto, saved);
                compensationRepository.save(newC);
            }
        }

        return employeeMapper.toDto(saved);
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