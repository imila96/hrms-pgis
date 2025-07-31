package com.pgis.hrms.core.auth.web;

import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.entity.Role;
import com.pgis.hrms.core.auth.repository.RoleRepository;
import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.core.auth.web.dto.CreateEmployeeRequest;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


@RestController
@RequestMapping("/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository     userRepo;
    private final EmployeeRepository empRepo;
    private final RoleRepository     roleRepo;
    private final PasswordEncoder    encoder;

    /* ------------------------------------------------------------------ */
    /*  POST /admin/users                                                 */
    /* ------------------------------------------------------------------ */
    @PostMapping
    @Transactional                // <-- keeps everything in ONE session
    public void createEmployee(@RequestBody @Valid CreateEmployeeRequest in) {

        /* ---------- USER --------------------------------------------- */
        User u = new User();
        u.setEmail(in.email());
        u.setPassword(encoder.encode(in.password()));
        u.getRoles().add(roleRepo.findByCode("EMPLOYEE").orElseThrow());
        userRepo.save(u);                     // PK gets generated here

        /* ---------- EMPLOYEE (shares the same PK) -------------------- */
        Employee e = new Employee();
        e.setUser(u);                         // @MapsId copies PK into e
        u.setEmployee(e);                     // (helps if you ever read user.getEmployee())
        e.setName(in.name());
        e.setContact(in.contact());
        e.setJobTitle(in.jobTitle());
        e.setHireDate(LocalDate.now());

        empRepo.save(e);                      // persisted in SAME context
    }
}