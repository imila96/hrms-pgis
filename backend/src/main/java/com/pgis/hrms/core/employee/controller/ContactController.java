package com.pgis.hrms.core.employee.controller;

import com.pgis.hrms.core.employee.dto.ContactDto;
import com.pgis.hrms.core.employee.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/employees/{employeeId}/contacts")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR','ADMIN','EMPLOYEE')")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<ContactDto> create(
            @PathVariable Integer employeeId,
            @RequestBody ContactDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(contactService.createContact(employeeId, dto));
    }

    @GetMapping
    public ResponseEntity<List<ContactDto>> getAllByEmployee(@PathVariable Integer employeeId) {
        return ResponseEntity.ok(contactService.getAllContactsByEmployee(employeeId));
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<ContactDto> getById(
            @PathVariable Integer employeeId,
            @PathVariable Integer contactId) {
        return ResponseEntity.ok(contactService.getContactById(employeeId, contactId));
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<ContactDto> update(
            @PathVariable Integer employeeId,
            @PathVariable Integer contactId,
            @RequestBody ContactDto dto) {
        return ResponseEntity.ok(contactService.updateContact(employeeId, contactId, dto));
    }

    @DeleteMapping("/{contactId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public ResponseEntity<Void> delete(
            @PathVariable Integer employeeId,
            @PathVariable Integer contactId) {
        contactService.deleteContact(employeeId, contactId);
        return ResponseEntity.noContent().build();
    }
}
