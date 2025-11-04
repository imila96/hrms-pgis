package com.pgis.hrms.core.employee.controller;

import com.pgis.hrms.core.employee.dto.EmploymentDto;
import com.pgis.hrms.core.employee.service.EmploymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/employees/{employeeId}/employments")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR','ADMIN')")
public class EmploymentController {

    private final EmploymentService employmentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<EmploymentDto> create(
            @PathVariable Integer employeeId,
            @RequestBody EmploymentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employmentService.createEmployment(employeeId, dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HR','ADMIN','EMPLOYEE','DIRECTOR')")
    public ResponseEntity<List<EmploymentDto>> getAllByEmployee(@PathVariable Integer employeeId) {
        return ResponseEntity.ok(employmentService.getAllEmploymentsByEmployee(employeeId));
    }

    @GetMapping("/{employmentId}")
    @PreAuthorize("hasAnyRole('HR','ADMIN','EMPLOYEE','DIRECTOR')")
    public ResponseEntity<EmploymentDto> getById(
            @PathVariable Integer employeeId,
            @PathVariable Integer employmentId) {
        return ResponseEntity.ok(employmentService.getEmploymentById(employeeId, employmentId));
    }

    @PutMapping("/{employmentId}")
    public ResponseEntity<EmploymentDto> update(
            @PathVariable Integer employeeId,
            @PathVariable Integer employmentId,
            @RequestBody EmploymentDto dto) {
        return ResponseEntity.ok(employmentService.updateEmployment(employeeId, employmentId, dto));
    }

    @DeleteMapping("/{employmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(
            @PathVariable Integer employeeId,
            @PathVariable Integer employmentId) {
        employmentService.deleteEmployment(employeeId, employmentId);
        return ResponseEntity.noContent().build();
    }
}
