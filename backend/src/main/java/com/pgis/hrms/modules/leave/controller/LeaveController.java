package com.pgis.hrms.modules.leave.controller;

import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.modules.leave.dto.*;
import com.pgis.hrms.modules.leave.repository.LeaveApplicationRepository;
import com.pgis.hrms.modules.leave.service.LeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.time.*;
import java.util.*;

@RestController
@RequestMapping("/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService  svc;
    private final UserRepository userRepo;

    private final LeaveApplicationRepository appRepo;

    private Integer currentEmpId(String email) {
        return userRepo.findByEmail(email).map(u->u.getEmployee().getEmployeeId())
                .orElseThrow();
    }

    /* ---- apply (employee) ---- */
    @PostMapping
    @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR')")
    public void apply(@AuthenticationPrincipal UserDetails ud,
                      @RequestBody ApplyLeaveRequest req) {     // <-- only JSON now
        svc.apply(currentEmpId(ud.getUsername()), req, null);   // file param is null
    }


    /* ---- my balances ---- */
    @GetMapping("/balance")
    @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR')")
    public List<LeaveBalanceDto> myBalances(@AuthenticationPrincipal UserDetails ud,
                                            @RequestParam(defaultValue="#{T(java.time.Year).now().value}") int year) {
        return svc.balances(currentEmpId(ud.getUsername()), year);
    }

    /* ---- HR approve / reject ---- */
    @PatchMapping("/{leaveId}")
    @PreAuthorize("hasRole('HR') or hasRole('ADMIN')")
    public void decide(@PathVariable Integer leaveId, @RequestParam boolean approve,
                       @AuthenticationPrincipal UserDetails ud) {
        Integer hrUserId = userRepo.findByEmail(ud.getUsername()).map(u->u.getUserId()).orElse(0);
        svc.decide(leaveId, approve, hrUserId);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('HR','ADMIN','DIRECTOR')")
    public List<MyLeaveDto> myLeaves(@AuthenticationPrincipal UserDetails ud) {
        int empId = currentEmpId(ud.getUsername());
        return appRepo.findByEmployeeEmployeeIdOrderByRequestedAtDesc(empId)
                .stream()
                .map(a -> new MyLeaveDto(
                        a.getLeaveId(),
                        a.getLeaveType(),
                        a.getStartDate(),
                        a.getEndDate(),
                        a.getStatus(),
                        a.getReason()))
                .toList();
    }
}
