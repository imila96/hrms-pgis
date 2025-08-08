package com.pgis.hrms.core.auth.web;

import com.pgis.hrms.core.auth.dto.PendingUserDto;
import com.pgis.hrms.core.auth.entity.Role;
import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.repository.RoleRepository;
import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final EmployeeRepository empRepo;
    private final PasswordEncoder encoder;

    /* -------------------- LIST ALL USERS -------------------- */
    @GetMapping
    public List<UserSummary> list() {
        return userRepo.findAll().stream().map(this::toSummary).toList();
    }

    /* -------- LIST USERS WITH NO ROLES ASSIGNED ------------- */
    @GetMapping("/unassigned")
    public List<UserSummary> unassigned() {
        return userRepo.findAll().stream()
                .filter(u -> u.getRoles().isEmpty())
                .map(this::toSummary)
                .toList();
    }

    /* -------------------- CREATE USER ONLY ------------------- */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummary create(@RequestBody @Valid CreateUserRequest r) {
        User u = new User();
        u.setEmail(r.email());
        u.setPassword(encoder.encode(r.password()));
        // Admin is setting the password now → mark as assigned
        u.setAdminPasswordAssigned(true);
        u.setPasswordChangedAt(java.time.LocalDateTime.now());
        userRepo.save(u); // no roles here
        return toSummary(u);
    }

    /* -------------- SET ROLES + ENSURE EMPLOYEE -------------- */
    @PutMapping("/{id}/roles")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void setRoles(@PathVariable Integer id, @RequestBody @Valid SetRolesRequest r) {
        User u = userRepo.findById(id).orElseThrow();

        // replace roles
        u.getRoles().clear();
        for (String code : r.roles()) {
            u.getRoles().add(roleRepo.findByCode(code).orElseThrow());
        }
        userRepo.save(u);

        // ensure an employee row exists for app roles
        Set<String> trigger = Set.of("ADMIN", "HR", "EMPLOYEE");
        if (!Collections.disjoint(r.roles(), trigger) && empRepo.findById(u.getUserId()).isEmpty()) {
            Employee e = new Employee();
            e.setUser(u); // @MapsId copies PK from u.getUserId()
            e.setName(Optional.ofNullable(r.name()).orElse(u.getEmail()));
            e.setEmail(Optional.ofNullable(r.empEmail()).orElse(u.getEmail()));
            e.setJobTitle(Optional.ofNullable(r.jobTitle()).orElse("Staff"));
            e.setHireDate(Optional.ofNullable(r.hireDate()).orElse(LocalDate.now()));
            e.setContact(r.contact());
            e.setAddress(r.address());
            empRepo.save(e);
        }
    }

    /* ------------------------- DELETE ------------------------ */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        empRepo.findById(id).ifPresent(empRepo::delete); // due to FK
        userRepo.deleteById(id);
    }

    /* -------------------- PASSWORD ASSIGN -------------------- */
    @PutMapping("/{id}/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setPassword(@PathVariable Integer id, @RequestBody @Valid SetPasswordRequest r) {
        var u = userRepo.findById(id).orElseThrow();
        u.setPassword(encoder.encode(r.password()));
        u.setAdminPasswordAssigned(true);
        u.setPasswordChangedAt(java.time.LocalDateTime.now());
        userRepo.save(u);
    }

    /* --------- PENDING (HR-created, no admin password yet) --- */
    @GetMapping("/pending-password")
    public List<PendingUserDto> pendingPassword() {
        return userRepo.findPendingUsersWithEmployee();
    }

    /* ------------------------- DTOs -------------------------- */
    public record CreateUserRequest(@Email String email, @Size(min = 6) String password) {}
    public record SetRolesRequest(
            @NotEmpty Set<String> roles,
            String name, String contact, String jobTitle, LocalDate hireDate, String address,
            String empEmail
    ) {}
    public record SetPasswordRequest(@Size(min = 6) String password) {}

    public record UserSummary(
            Integer id,
            String email,
            List<String> roles,
            boolean hasEmployee,
            boolean adminPasswordAssigned // NEW
    ) {}

    private UserSummary toSummary(User u) {
        List<String> roleCodes = u.getRoles().stream().map(Role::getCode).toList();
        boolean hasEmployee = u.getEmployee() != null; // or empRepo.existsById(u.getUserId())
        boolean assigned = Boolean.TRUE.equals(u.getAdminPasswordAssigned());
        return new UserSummary(u.getUserId(), u.getEmail(), roleCodes, hasEmployee, assigned);
    }
}
