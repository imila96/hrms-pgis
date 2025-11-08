package com.pgis.hrms.modules.leave.controller;

import com.pgis.hrms.core.employee.repository.EmploymentRepository;
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
    private final EmploymentRepository employmentRepo;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public List<LeaveSummaryDto> pending() {
        return appRepo.findByStatusOrderByRequestedAtDesc(LeaveStatus.PENDING)
                .stream()
                .map(app -> {
                    String department = employmentRepo
                            .findFirstByEmployeeEmployeeIdOrderByDateOfJoiningAsc(app.getEmployee().getEmployeeId())
                            .map(emp -> emp.getDepartment() != null ? emp.getDepartment() : "N/A")
                            .orElse("N/A");
                    
                    return new LeaveSummaryDto(
                            app.getLeaveId(),
                            app.getEmployee().getName(),
                            department,
                            app.getLeaveType(),
                            app.getStartDate(),
                            app.getEndDate(),
                            app.getStatus(),
                            app.getReason()
                    );
                })
                .toList();
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN') or hasRole('DIRECTOR')")
    public List<LeaveSummaryDto> all() {
        return appRepo.findAll()
                .stream()
                .sorted((a, b) -> {
                    if (a.getRequestedAt() == null) return 1;
                    if (b.getRequestedAt() == null) return -1;
                    return b.getRequestedAt().compareTo(a.getRequestedAt());
                })
                .map(app -> {
                    String department = employmentRepo
                            .findFirstByEmployeeEmployeeIdOrderByDateOfJoiningAsc(app.getEmployee().getEmployeeId())
                            .map(emp -> emp.getDepartment() != null ? emp.getDepartment() : "N/A")
                            .orElse("N/A");
                    
                    return new LeaveSummaryDto(
                            app.getLeaveId(),
                            app.getEmployee().getName(),
                            department,
                            app.getLeaveType(),
                            app.getStartDate(),
                            app.getEndDate(),
                            app.getStatus(),
                            app.getReason()
                    );
                })
                .toList();
    }
}