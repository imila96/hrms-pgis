package com.pgis.hrms.modules.profile.service;

import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.profile.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserRepository     userRepo;
    private final EmployeeRepository empRepo;

    /* ---------- helpers ---------- */
    private static EmployeeProfileDto toDto(Employee e) {
        if (e == null) {
            throw new RuntimeException("No employee profile linked to this user");
        }
        return new EmployeeProfileDto(
                e.getEmployeeId(),
                e.getEmail(),
                e.getName(),
                e.getContact(),
                e.getAddress(),
                e.getJobTitle(),
                e.getHireDate());
    }

    /* ---------- employee self-service ---------- */

    public EmployeeProfileDto myProfile(String email) {
        var user = userRepo.findByEmail(email).orElseThrow();
        return toDto(user.getEmployee());
    }

    @Transactional
    public EmployeeProfileDto updateMyProfile(String email, ProfileUpdateRequest in) {
        var emp = userRepo.findByEmail(email).orElseThrow().getEmployee();
        emp.setContact(in.contact());
        emp.setAddress(in.address());
        // save not required due to transactional dirty-checking
        return toDto(emp);
    }

    /* ---------- admin operations ---------- */

    public EmployeeProfileDto getById(Integer id) {
        return toDto(empRepo.findById(id).orElseThrow());
    }

    @Transactional
    public EmployeeProfileDto adminUpdate(Integer id, EmployeeAdminUpdateRequest in) {
        var emp  = empRepo.findById(id).orElseThrow();
        // Find the user linked to this employee
        var user = userRepo.findAll().stream()
                .filter(u -> u.getEmployee() != null && u.getEmployee().getEmployeeId().equals(id))
                .findFirst()
                .orElse(null);

        if (in.name()      != null) emp.setName(in.name());
        if (in.contact()   != null) emp.setContact(in.contact());
        if (in.address()   != null) emp.setAddress(in.address());
        if (in.jobTitle()  != null) emp.setJobTitle(in.jobTitle());
        if (in.hireDate()  != null) emp.setHireDate(in.hireDate());
        
        if (user != null) {
            if (in.active()    != null) user.setActive(in.active());
            if (in.verified()  != null) user.setVerified(in.verified());
        }

        return toDto(emp);
    }
}
