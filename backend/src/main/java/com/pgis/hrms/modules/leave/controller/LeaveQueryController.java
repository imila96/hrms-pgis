package com.pgis.hrms.modules.leave.controller;

import com.pgis.hrms.modules.leave.dto.LeaveSummaryDto;
import com.pgis.hrms.modules.leave.model.LeaveApplication;
import com.pgis.hrms.modules.leave.model.LeaveStatus;
import com.pgis.hrms.modules.leave.repository.LeaveApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
class LeaveQueryController {

    private final LeaveApplicationRepository appRepo;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public List<LeaveSummaryDto> pending() {
        return appRepo.findByStatusOrderByRequestedAtDesc(LeaveStatus.PENDING)
                .stream()
                .map(app -> new LeaveSummaryDto(
                        app.getLeaveId(),
                        app.getEmployee().getName(),
                        app.getLeaveType(),
                        app.getStartDate(),
                        app.getEndDate(),
                        app.getStatus()))
                .toList();
    }
}