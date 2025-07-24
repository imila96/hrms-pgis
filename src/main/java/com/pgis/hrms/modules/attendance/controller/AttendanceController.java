package com.pgis.hrms.modules.attendance.controller;

import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.modules.attendance.dto.DailyAttendanceDto;
import com.pgis.hrms.modules.attendance.model.AttendanceEventType;
import com.pgis.hrms.modules.attendance.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.time.*;
import java.util.List;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService svc;
    private final UserRepository    userRepo;   // <- NEW

    /* helper to resolve logged‑in employeeId from email held in JWT */
    private Integer currentEmployeeId(String email) {
        return userRepo.findByEmail(email)
                .map(u -> u.getEmployee().getEmployeeId())
                .orElseThrow(() -> new RuntimeException("User not linked to employee record"));
    }

    /* ---- clock‑in / clock‑out / break events ---- */
    @PostMapping("/punch")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public void punch(@AuthenticationPrincipal UserDetails ud,
                      @RequestParam AttendanceEventType type) {
        Integer empId = currentEmployeeId(ud.getUsername());
        svc.punch(empId, type, null);
    }

    /* ---- month view for self ---- */
    @GetMapping("/me")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<DailyAttendanceDto> myMonth(@AuthenticationPrincipal UserDetails ud,
                                            @RequestParam @DateTimeFormat(pattern="yyyy-MM") YearMonth month) {
        Integer empId = currentEmployeeId(ud.getUsername());
        return svc.summary(empId, month);
    }

    /* ---- admin view for any employee ---- */
    @GetMapping("/{empId}")
    @PreAuthorize("hasRole('ADMIN')")
    public List<DailyAttendanceDto> viewEmployee(@PathVariable Integer empId,
                                                 @RequestParam @DateTimeFormat(pattern="yyyy-MM") YearMonth month) {
        return svc.summary(empId, month);
    }
}