package com.pgis.hrms.modules.announcement.controller;

import com.pgis.hrms.modules.announcement.dto.*;
import com.pgis.hrms.modules.announcement.model.AnnouncementStatus;
import com.pgis.hrms.modules.announcement.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService svc;


    /** create a new draft (HR / Admin) */
    @PostMapping
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public Map<String,Integer> create(@AuthenticationPrincipal UserDetails ud,
                                      @RequestBody AnnouncementDetailDto body) {
        Integer id = svc.create(ud.getUsername(), body);
        return Map.of("announcementId", id);
    }

    /** update an existing draft */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public void updateDraft(@PathVariable Integer id,
                            @AuthenticationPrincipal UserDetails ud,
                            @RequestBody AnnouncementDetailDto body) {
        svc.updateDraft(id, ud.getUsername(), body);
    }

    /** publish a draft */
    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public void publish(@PathVariable Integer id,
                        @AuthenticationPrincipal UserDetails ud) {
        svc.publish(id, ud.getUsername());
    }

    /* ──────────────── Queries ──────────────── */

    /**
     * Public list – everything that is already PUBLISHED
     * (employees and anonymous users will hit ONLY this).
     */
    @GetMapping("/public")
    public List<AnnouncementDto> listPublished() {
        return svc.list(AnnouncementStatus.PUBLISHED);
    }

    /**
     * HR/Admin list – filter drafts / archives / all.
     * If status param is omitted we return *all* announcements.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('HR','ADMIN')")
    public List<AnnouncementDto> listForHr(@RequestParam(required = false)
                                           AnnouncementStatus status) {
        return svc.list(status);        // null → “all”
    }

    /** detail view (everyone can read a single announcement) */
    @GetMapping("/{id}")
    public AnnouncementDetailDto detail(@PathVariable Integer id) {
        return svc.detail(id);
    }
}
