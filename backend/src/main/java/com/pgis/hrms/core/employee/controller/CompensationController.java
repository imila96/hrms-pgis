package com.pgis.hrms.core.employee.controller;

import com.pgis.hrms.core.employee.dto.CompensationDto;
import com.pgis.hrms.core.employee.service.CompensationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/employees/{employeeId}/compensations")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR','ADMIN')")
public class CompensationController {

    private final CompensationService compensationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<CompensationDto> create(
            @PathVariable Integer employeeId,
            @RequestBody CompensationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(compensationService.createCompensation(employeeId, dto));
    }

    @GetMapping
    public ResponseEntity<List<CompensationDto>> getAllByEmployee(@PathVariable Integer employeeId) {
        return ResponseEntity.ok(compensationService.getAllCompensationsByEmployee(employeeId));
    }

    @GetMapping("/{compensationId}")
    public ResponseEntity<CompensationDto> getById(
            @PathVariable Integer employeeId,
            @PathVariable Integer compensationId) {
        return ResponseEntity.ok(compensationService.getCompensationById(employeeId, compensationId));
    }

    @PutMapping("/{compensationId}")
    public ResponseEntity<CompensationDto> update(
            @PathVariable Integer employeeId,
            @PathVariable Integer compensationId,
            @RequestBody CompensationDto dto) {
        return ResponseEntity.ok(compensationService.updateCompensation(employeeId, compensationId, dto));
    }

    @DeleteMapping("/{compensationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ResponseEntity<Void> delete(
            @PathVariable Integer employeeId,
            @PathVariable Integer compensationId) {
        compensationService.deleteCompensation(employeeId, compensationId);
        return ResponseEntity.noContent().build();
    }
}
