package com.pgis.hrms.modules.policy.controller;

import com.pgis.hrms.modules.policy.dto.*;
import com.pgis.hrms.modules.policy.model.PolicyStatus;
import com.pgis.hrms.modules.policy.service.PolicyService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService svc;

    /* ---------- HR endpoints ---------- */
    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public Map<String,Integer> create(@AuthenticationPrincipal UserDetails ud,
                                      @RequestBody PolicyDetailDto body) {
        Integer id = svc.create(ud.getUsername(), body);
        return Map.of("policyId", id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public void update(@PathVariable Integer id,
                       @AuthenticationPrincipal UserDetails ud,
                       @RequestBody PolicyDetailDto body) {
        svc.update(id, ud.getUsername(), body);
    }

    /* ---------- Director decision ---------- */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('DIRECTOR')")
    public void decide(@PathVariable Integer id,
                       @RequestParam boolean approve,
                       @AuthenticationPrincipal UserDetails ud) {
        svc.decide(id, approve, ud.getUsername());
    }

    /* ---------- Listing ---------- */
    @GetMapping
    public List<PolicyDto> list(@RequestParam(required=false) PolicyStatus status,
                                @RequestParam(required=false) Boolean effective) {
        return svc.list(status, effective);
    }

    @GetMapping("/{id}")
    public PolicyDetailDto one(@PathVariable Integer id) {
        return svc.one(id);
    }
}
