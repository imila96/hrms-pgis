package com.pgis.hrms.modules.profile.controller;

import com.pgis.hrms.modules.profile.dto.*;
import com.pgis.hrms.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/employees")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminEmployeeController {

    private final ProfileService svc;

    /* GET /admin/employees/{id} */
    @GetMapping("/{id}")
    public EmployeeProfileDto get(@PathVariable Integer id) {
        return svc.getById(id);
    }

    /* PUT /admin/employees/{id} */
    @PutMapping("/{id}")
    public EmployeeProfileDto update(@PathVariable Integer id,
                                     @RequestBody EmployeeAdminUpdateRequest req) {
        return svc.adminUpdate(id, req);
    }
}
