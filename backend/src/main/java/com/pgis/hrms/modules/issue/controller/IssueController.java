package com.pgis.hrms.modules.issue.controller;

import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.modules.issue.dto.IssueCreateReq;
import com.pgis.hrms.modules.issue.dto.IssueRes;
import com.pgis.hrms.modules.issue.dto.IssueResolveReq;
import com.pgis.hrms.modules.issue.entity.IssueReport.Status;
import com.pgis.hrms.modules.issue.entity.IssueReport.IssueType;
import com.pgis.hrms.modules.issue.service.IssueService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/issues")
@RequiredArgsConstructor
public class IssueController {
    private final IssueService service;
    private final UserRepository userRepository;

    // EMPLOYEE: create
    @PostMapping
    @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR','EMPLOYEE')")
    public IssueRes create(Authentication auth, @RequestBody IssueCreateReq req) {
        var username = auth.getName(); // or cast your UserPrincipal to get ID
        Long userId = null;
        return service.create(username, userId, req);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR','EMPLOYEE')")
    public List<IssueRes> my(Authentication auth, @RequestParam(required = false) Status status) {
        return service.my(auth.getName(), status);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<IssueRes> all(@RequestParam(required = false) Status status) {
        return service.all(status);
    }

    // HR: list all complaints
    @GetMapping("/complaints")
    @PreAuthorize("hasRole('HR')")
    public List<IssueRes> complaints(@RequestParam(required = false) Status status) {
        return service.getByType(IssueType.COMPLAINT, status);
    }

    // ADMIN: list all technical issues
    @GetMapping("/technical")
    @PreAuthorize("hasRole('ADMIN')")
    public List<IssueRes> technical(@RequestParam(required = false) Status status) {
        return service.getByType(IssueType.TECHNICAL_ISSUE, status);
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public IssueRes resolve(@PathVariable Long id, 
                           @Valid @RequestBody IssueResolveReq req,
                           Authentication auth) {
        String username = auth.getName();
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String resolverName = username; // Default to email
        if (user.getEmployee() != null && user.getEmployee().getName() != null) {
            resolverName = user.getEmployee().getName();
        }
        
        return service.resolve(id, req.remark(), resolverName);
    }
}
