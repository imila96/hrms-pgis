package com.pgis.hrms.modules.dashboard.controller;

import com.pgis.hrms.modules.dashboard.dto.AdminDashboardSummaryDto;
import com.pgis.hrms.modules.dashboard.dto.DirectorDashboardSummaryDto;
import com.pgis.hrms.modules.dashboard.dto.HrDashboardSummaryDto;
import com.pgis.hrms.modules.dashboard.service.AdminDashboardService;
import com.pgis.hrms.modules.dashboard.service.DirectorDashboardService;
import com.pgis.hrms.modules.dashboard.service.HrDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class HrDashboardController {

    private final HrDashboardService hrDashboardService;
    private final AdminDashboardService adminDashboardService;
    private final DirectorDashboardService directorDashboardService;

    @GetMapping("/hr-home")
    public ResponseEntity<HrDashboardSummaryDto> getHrHome() {
        HrDashboardSummaryDto dto = hrDashboardService.getHrDashboardSummary();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/admin-home")
    public ResponseEntity<AdminDashboardSummaryDto> getAdminHome() {
        AdminDashboardSummaryDto dto = adminDashboardService.getAdminDashboardSummary();
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/director-home")
    public ResponseEntity<DirectorDashboardSummaryDto> getDirectorHome() {
        DirectorDashboardSummaryDto dto = directorDashboardService.getDirectorDashboardSummary();
        return ResponseEntity.ok(dto);
    }
}
