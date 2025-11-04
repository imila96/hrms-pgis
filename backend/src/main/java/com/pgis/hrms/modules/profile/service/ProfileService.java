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
                e.getGender(),
                e.getDateOfBirth(),
                e.getNationality(),
                e.getNicNo(),
                e.getMaritalStatus(),
                e.getReligion(),
                e.getBloodGroup(),
                e.getProfileImage());
    }

    /* ---------- employee self-service ---------- */

    public EmployeeProfileDto myProfile(String email) {
        var user = userRepo.findByEmail(email).orElseThrow();
        return toDto(user.getEmployee());
    }

    @Transactional
    public EmployeeProfileDto updateMyProfile(String email, ProfileUpdateRequest in) {
        var emp = userRepo.findByEmail(email).orElseThrow().getEmployee();
        if (in.gender() != null) emp.setGender(in.gender());
        if (in.dateOfBirth() != null) emp.setDateOfBirth(in.dateOfBirth());
        if (in.nationality() != null) emp.setNationality(in.nationality());
        if (in.maritalStatus() != null) emp.setMaritalStatus(in.maritalStatus());
        if (in.religion() != null) emp.setReligion(in.religion());
        if (in.bloodGroup() != null) emp.setBloodGroup(in.bloodGroup());
        if (in.profileImage() != null) emp.setProfileImage(in.profileImage());
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

        if (in.name() != null) emp.setName(in.name());
        if (in.gender() != null) emp.setGender(in.gender());
        if (in.dateOfBirth() != null) emp.setDateOfBirth(in.dateOfBirth());
        if (in.nationality() != null) emp.setNationality(in.nationality());
        if (in.nicNo() != null) emp.setNicNo(in.nicNo());
        if (in.maritalStatus() != null) emp.setMaritalStatus(in.maritalStatus());
        if (in.religion() != null) emp.setReligion(in.religion());
        if (in.bloodGroup() != null) emp.setBloodGroup(in.bloodGroup());
        if (in.profileImage() != null) emp.setProfileImage(in.profileImage());
        
        if (user != null) {
            if (in.active()    != null) user.setActive(in.active());
            if (in.verified()  != null) user.setVerified(in.verified());
        }

        return toDto(emp);
    }
}
