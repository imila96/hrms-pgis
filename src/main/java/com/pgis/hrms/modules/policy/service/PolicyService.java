package com.pgis.hrms.modules.policy.service;


import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.modules.announcement.service.AnnouncementService;
import com.pgis.hrms.modules.policy.dto.*;
import com.pgis.hrms.modules.policy.model.*;
import com.pgis.hrms.modules.policy.repository.PolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository repo;
    private final UserRepository userRepo;
    private final AnnouncementService annSvc; // simple publish helper

    /* -------- HR actions -------- */

    @Transactional
    public Integer create(String email, PolicyDetailDto in) {
        User hr = userRepo.findByEmail(email).orElseThrow();
        Policy p = new Policy();
        p.setTitle(in.title());
        p.setDescription(in.description());
        p.setEffectiveDate(in.effectiveDate());
        p.setCreatedBy(hr);
        repo.save(p);
        return p.getPolicyId();
    }

    @Transactional
    public void update(Integer id, String email, PolicyDetailDto in) {
        Policy p = repo.findById(id).orElseThrow();
        if (p.getStatus() != PolicyStatus.PENDING)
            throw new RuntimeException("Only pending policies can be edited");
        if (!p.getCreatedBy().getEmail().equals(email))
            throw new RuntimeException("Not owner of policy");
        p.setTitle(in.title());
        p.setDescription(in.description());
        p.setEffectiveDate(in.effectiveDate());
    }

    /* -------- Director decision -------- */
    @Transactional
    public void decide(Integer id, boolean approve, String directorEmail) {
        Policy p = repo.findById(id).orElseThrow();
        if (p.getStatus() != PolicyStatus.PENDING)
            throw new RuntimeException("Already decided");
        p.setStatus(approve ? PolicyStatus.APPROVED : PolicyStatus.REJECTED);
        p.setDecidedAt(LocalDateTime.now());
        p.setDecidedBy(userRepo.findByEmail(directorEmail).orElseThrow());
        if (approve) {
            annSvc.publishPolicyAnnouncement(p); // transactional with policy
        }
    }

    /* -------- Queries ---------- */
    @Transactional(readOnly = true)
    public List<PolicyDto> list(PolicyStatus status, Boolean effective) {
        return repo.search(status, effective, LocalDate.now())
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public PolicyDetailDto one(Integer id) {
        return repo.findById(id).map(this::toDetail).orElseThrow();
    }

    /* -------- mapping helpers -------- */
    private PolicyDto toDto(Policy p) {
        return new PolicyDto(p.getPolicyId(), p.getTitle(), p.getEffectiveDate(), p.getStatus());
    }
    private PolicyDetailDto toDetail(Policy p) {
        return new PolicyDetailDto(
                p.getPolicyId(),
                p.getTitle(),
                p.getDescription(),
                p.getEffectiveDate(),
                p.getStatus(),
                p.getCreatedBy().getEmail(),
                p.getDecidedBy() != null ? p.getDecidedBy().getEmail() : null,
                p.getDecidedAt());
    }
}