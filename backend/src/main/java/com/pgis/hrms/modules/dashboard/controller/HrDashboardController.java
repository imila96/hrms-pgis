package com.pgis.hrms.modules.dashboard.controller;

import com.pgis.hrms.modules.dashboard.dto.HrDashboardSummaryDto;
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

    @GetMapping("/hr-home")
    public ResponseEntity<HrDashboardSummaryDto> getHrHome() {
        HrDashboardSummaryDto dto = hrDashboardService.getHrDashboardSummary();
        return ResponseEntity.ok(dto);
    }
}
