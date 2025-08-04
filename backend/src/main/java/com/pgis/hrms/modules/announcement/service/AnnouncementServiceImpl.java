package com.pgis.hrms.modules.announcement.service;

import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.modules.announcement.dto.*;
import com.pgis.hrms.modules.announcement.model.*;
import com.pgis.hrms.modules.announcement.repository.*;
import com.pgis.hrms.modules.policy.model.Policy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnnouncementServiceImpl implements AnnouncementService {

    private final AnnouncementRepository       repo;
    private final AnnouncementVersionRepository verRepo;
    private final UserRepository userRepo;

    /* ------------ HR workflow ------------ */
    @Override @Transactional
    public Integer create(String hrEmail, AnnouncementDetailDto draft) {
        Integer userId = userRepo.findByEmail(hrEmail).map(u->u.getUserId()).orElseThrow();
        Announcement a = new Announcement();
        a.setTitle(draft.title());
        a.setDescription(draft.description());
        a.setCreatedBy(userId);
        repo.save(a);
        // first version record
        createVersion(a, userId);
        return a.getAnnouncementId();
    }

    @Override @Transactional
    public void updateDraft(Integer id, String hrEmail, AnnouncementDetailDto draft) {
        Announcement a = repo.findById(id).orElseThrow();
        if (a.getStatus()!=AnnouncementStatus.DRAFT)
            throw new RuntimeException("Only drafts can be edited");
        Integer uid = userRepo.findByEmail(hrEmail).map(u->u.getUserId()).orElseThrow();
        a.setTitle(draft.title());
        a.setDescription(draft.description());
        a.setCurrentVersion(a.getCurrentVersion()+1);
        createVersion(a, uid);
    }

    @Override @Transactional
    public void publish(Integer id, String hrEmail) {
        Announcement a = repo.findById(id).orElseThrow();
        if (a.getStatus()!=AnnouncementStatus.DRAFT)
            throw new RuntimeException("Already published / archived");
        Integer uid = userRepo.findByEmail(hrEmail).map(u->u.getUserId()).orElseThrow();
        a.setStatus(AnnouncementStatus.PUBLISHED);
        a.setPublishedBy(uid);
        a.setPublishedDate(LocalDateTime.now());
    }

    /* ------------ Queries ------------ */
    @Override @Transactional(readOnly = true)
    public List<AnnouncementDto> listPublished() {
        return repo.findByStatusOrderByPublishedDateDesc(AnnouncementStatus.PUBLISHED)
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override @Transactional(readOnly = true)
    public AnnouncementDetailDto detail(Integer id) {
        return repo.findById(id).map(this::toDetail).orElseThrow();
    }

    /* ------------ Policy hook ------------ */
    @Override @Transactional
    public void publishPolicyAnnouncement(Policy p) {
        Announcement a = new Announcement();
        a.setTitle("New Policy · " + p.getTitle());
        a.setDescription(p.getDescription());
        a.setStatus(AnnouncementStatus.PUBLISHED);
        a.setCurrentVersion(1);
        a.setCreatedBy(p.getCreatedBy().getUserId());
        a.setPublishedBy(p.getDecidedBy().getUserId());
        a.setPublishedDate(LocalDateTime.now());
        repo.save(a);
    }

    /* ------------ helpers ------------ */
    private void createVersion(Announcement a, Integer editorId) {
        AnnouncementVersion v = new AnnouncementVersion();
        v.setAnnouncement(a);
        v.setTitle(a.getTitle());
        v.setDescription(a.getDescription());
        v.setEditedBy(editorId);
        v.setEditedDate(LocalDateTime.now());
        verRepo.save(v);
    }

    private AnnouncementDto toDto(Announcement a) {
        return new AnnouncementDto(a.getAnnouncementId(),
                a.getTitle(),
                a.getStatus(),
                a.getPublishedDate());
    }

    private AnnouncementDetailDto toDetail(Announcement a) {
        return new AnnouncementDetailDto(
                a.getAnnouncementId(),
                a.getTitle(),
                a.getDescription(),
                a.getStatus(),
                a.getCreatedDate(),
                userRepo.findById(a.getCreatedBy()).map(u->u.getEmail()).orElse(null),
                a.getPublishedDate(),
                a.getPublishedBy()!=null ? userRepo.findById(a.getPublishedBy()).map(u->u.getEmail()).orElse(null) : null);
    }

    @Override @Transactional(readOnly = true)
    public List<AnnouncementDto> list(AnnouncementStatus status) {
        // if caller passes null we just fetch everything
        return repo.search(status)                // reuse the custom JPQL already in the repo
                .stream()
                .map(this::toDto)
                .toList();
    }
}