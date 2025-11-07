package com.pgis.hrms.modules.profile.controller;

import com.pgis.hrms.modules.profile.dto.*;
import com.pgis.hrms.modules.profile.service.ProfileService;
import com.pgis.hrms.core.employee.service.ContactService;
import com.pgis.hrms.core.employee.service.EmploymentService;
import com.pgis.hrms.core.employee.service.CompensationService;
import com.pgis.hrms.core.employee.dto.ContactDto;
import com.pgis.hrms.core.employee.dto.EmploymentDto;
import com.pgis.hrms.core.employee.dto.CompensationDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService svc;
    private final ContactService contactService;
    private final EmploymentService employmentService;
    private final CompensationService compensationService;

    /* GET /profile/me */
    @GetMapping("/me")
    public EmployeeProfileDto me(@AuthenticationPrincipal UserDetails ud) {
        return svc.myProfile(ud.getUsername());
    }

    /* PUT /profile/me */
    @PutMapping("/me")
    public EmployeeProfileDto updateMe(@AuthenticationPrincipal UserDetails ud,
                                       @RequestBody ProfileUpdateRequest req) {
        return svc.updateMyProfile(ud.getUsername(), req);
    }

    /* GET /profile/contacts */
    @GetMapping("/contacts")
    public java.util.List<ContactDto> myContacts(@AuthenticationPrincipal UserDetails ud) {
        var dto = svc.myProfile(ud.getUsername());
        return contactService.getAllContactsByEmployee(dto.id());
    }

    /* POST /profile/contacts */
    @PostMapping("/contacts")
    public ResponseEntity<ContactDto> createContact(@AuthenticationPrincipal UserDetails ud,
                                                   @RequestBody ContactDto dto) {
        var profile = svc.myProfile(ud.getUsername());
        var created = contactService.createContact(profile.id(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /* PUT /profile/contacts/{contactId} */
    @PutMapping("/contacts/{contactId}")
    public ResponseEntity<ContactDto> updateContact(@AuthenticationPrincipal UserDetails ud,
                                                  @PathVariable Integer contactId,
                                                  @RequestBody ContactDto dto) {
        var profile = svc.myProfile(ud.getUsername());
        var updated = contactService.updateContact(profile.id(), contactId, dto);
        return ResponseEntity.ok(updated);
    }

    /* GET /profile/employments */
    @GetMapping("/employments")
    public java.util.List<EmploymentDto> myEmployments(@AuthenticationPrincipal UserDetails ud) {
        var dto = svc.myProfile(ud.getUsername());
        return employmentService.getAllEmploymentsByEmployee(dto.id());
    }

    /* POST /profile/employments */
    @PostMapping("/employments")
    public ResponseEntity<EmploymentDto> createEmployment(@AuthenticationPrincipal UserDetails ud,
                                                        @RequestBody EmploymentDto dto) {
        var profile = svc.myProfile(ud.getUsername());
        var created = employmentService.createEmployment(profile.id(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /* PUT /profile/employments/{employmentId} */
    @PutMapping("/employments/{employmentId}")
    public ResponseEntity<EmploymentDto> updateEmployment(@AuthenticationPrincipal UserDetails ud,
                                                       @PathVariable Integer employmentId,
                                                       @RequestBody EmploymentDto dto) {
        var profile = svc.myProfile(ud.getUsername());
        var updated = employmentService.updateEmployment(profile.id(), employmentId, dto);
        return ResponseEntity.ok(updated);
    }

    /* GET /profile/compensations */
    @GetMapping("/compensations")
    public java.util.List<CompensationDto> myCompensations(@AuthenticationPrincipal UserDetails ud) {
        var dto = svc.myProfile(ud.getUsername());
        return compensationService.getAllCompensationsByEmployee(dto.id());
    }

    /* POST /profile/compensations */
    @PostMapping("/compensations")
    public ResponseEntity<CompensationDto> createCompensation(@AuthenticationPrincipal UserDetails ud,
                                                            @RequestBody CompensationDto dto) {
        var profile = svc.myProfile(ud.getUsername());
        var created = compensationService.createCompensation(profile.id(), dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /* PUT /profile/compensations/{compensationId} */
    @PutMapping("/compensations/{compensationId}")
    public ResponseEntity<CompensationDto> updateCompensation(@AuthenticationPrincipal UserDetails ud,
                                                           @PathVariable Integer compensationId,
                                                           @RequestBody CompensationDto dto) {
        var profile = svc.myProfile(ud.getUsername());
        var updated = compensationService.updateCompensation(profile.id(), compensationId, dto);
        return ResponseEntity.ok(updated);
    }
}
