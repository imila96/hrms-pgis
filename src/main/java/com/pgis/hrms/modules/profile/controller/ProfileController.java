package com.pgis.hrms.modules.profile.controller;

import com.pgis.hrms.modules.profile.dto.*;
import com.pgis.hrms.modules.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService svc;

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
}
