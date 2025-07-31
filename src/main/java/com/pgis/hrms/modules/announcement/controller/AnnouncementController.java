package com.pgis.hrms.modules.announcement.controller;

import com.pgis.hrms.modules.announcement.dto.*;
import com.pgis.hrms.modules.announcement.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService svc;

    /* --- HR workflow --- */
    @PostMapping
    @PreAuthorize("hasRole('HR')")
    public Map<String,Integer> create(@AuthenticationPrincipal UserDetails ud,
                                      @RequestBody AnnouncementDetailDto body) {
        Integer id = svc.create(ud.getUsername(), body);
        return Map.of("announcementId", id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR')")
    public void updateDraft(@PathVariable Integer id,
                            @AuthenticationPrincipal UserDetails ud,
                            @RequestBody AnnouncementDetailDto body) {
        svc.updateDraft(id, ud.getUsername(), body);
    }

    @PatchMapping("/{id}/publish")
    @PreAuthorize("hasRole('HR')")
    public void publish(@PathVariable Integer id,
                        @AuthenticationPrincipal UserDetails ud) {
        svc.publish(id, ud.getUsername());
    }

    /* --- Portal queries --- */
    @GetMapping
    public List<AnnouncementDto> list() {
        return svc.listPublished();
    }

    @GetMapping("/{id}")
    public AnnouncementDetailDto detail(@PathVariable Integer id) {
        return svc.detail(id);
    }
}