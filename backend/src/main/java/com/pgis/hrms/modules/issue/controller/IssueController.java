package com.pgis.hrms.modules.issue.controller;

import com.pgis.hrms.modules.issue.dto.IssueCreateReq;
import com.pgis.hrms.modules.issue.dto.IssueRes;
import com.pgis.hrms.modules.issue.entity.IssueReport.Status;
import com.pgis.hrms.modules.issue.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
public class IssueController {
    private final IssueService service;

    // EMPLOYEE: create
    @PostMapping
    @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR')")
    public IssueRes create(Authentication auth, @RequestBody IssueCreateReq req) {
        var username = auth.getName(); // or cast your UserPrincipal to get ID
        Long userId = null;
        return service.create(username, userId, req);
    }

    // EMPLOYEE: list own
    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR')")
    public List<IssueRes> my(Authentication auth, @RequestParam(required = false) Status status) {
        return service.my(auth.getName(), status);
    }

    // ADMIN: list all (optional ?status=PENDING|RESOLVED)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<IssueRes> all(@RequestParam(required = false) Status status) {
        return service.all(status);
    }

    // ADMIN: mark resolved
    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public IssueRes resolve(@PathVariable Long id) {
        return service.resolve(id);
    }
}
