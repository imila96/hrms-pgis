package com.pgis.hrms.core.employee.controller;



import com.pgis.hrms.core.employee.dto.EmployeeDto;
import com.pgis.hrms.core.employee.service.EmployeeService;
import com.pgis.hrms.core.employee.dto.EmployeeRequest;
import com.pgis.hrms.core.employee.dto.EmployeeSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<EmployeeDto> create(@RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(employeeService.createEmployee(dto));
    }

    //create an employee together with contact, employment and compensation in a single request
    @PostMapping("/create")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<EmployeeDto> createFull(@RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.createEmployee(request));
    }

    @GetMapping
    public ResponseEntity<List<EmployeeDto>> getAll() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/summary")
    public ResponseEntity<List<EmployeeSummaryDto>> getSummaries() {
        return ResponseEntity.ok(employeeService.getEmployeeSummaries());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto> update(
            @PathVariable Integer id,
            @RequestBody EmployeeDto dto) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, dto));
    }

    // update full employee payload (employee + contact + employment + compensation)
    @PutMapping("/{id}/full")
    public ResponseEntity<EmployeeDto> updateFull(
            @PathVariable Integer id,
            @RequestBody EmployeeRequest request) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN','HR','EMPLOYEE','DIRECTOR')")
    @GetMapping("/me")
    public ResponseEntity<EmployeeDto> me() {
        return ResponseEntity.ok(employeeService.getMyProfile());
    }
    
    @GetMapping("/validate-email")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<Boolean> validateEmail(@RequestParam String email) {
        boolean exists = employeeService.emailExists(email);
        return ResponseEntity.ok(exists);
    }

}
