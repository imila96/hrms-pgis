package com.pgis.hrms.modules.attendance.service;

import com.pgis.hrms.modules.attendance.dto.AttendanceStateDto;
import com.pgis.hrms.modules.attendance.dto.DailyAttendanceDto;
import com.pgis.hrms.modules.attendance.model.AttendanceEvent;
import com.pgis.hrms.modules.attendance.model.AttendanceEventType;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.attendance.repository.AttendanceEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private static final long DUP_GUARD_SECONDS = 60;

    private final AttendanceEventRepository evtRepo;
    private final EmployeeRepository        empRepo;

    /* ------------- write side ------------- */
    @Transactional
    public void punch(Integer employeeId,
                      AttendanceEventType type,
                      LocalDateTime when) {

        var emp  = empRepo.findById(employeeId).orElseThrow();
        var now  = (when == null ? LocalDateTime.now() : when);
        var date = now.toLocalDate();

        // Today’s last event and presence of IN/OUT
        var lastOpt = evtRepo.findTopByEmployee_EmployeeIdAndEventDateOrderByTimestampDesc(employeeId, date);
        boolean hasIn  = evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(employeeId, date, AttendanceEventType.CHECK_IN);
        boolean hasOut = evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(employeeId, date, AttendanceEventType.CHECK_OUT);

        // Idempotency: if same event within 60s, ignore
        if (lastOpt.isPresent() && lastOpt.get().getEventType() == type) {
            var lastTs = lastOpt.get().getTimestamp();
            if (lastTs != null && Duration.between(lastTs, now).abs().getSeconds() < DUP_GUARD_SECONDS) {
                return; // treat as success, no new row
            }
        }

        // Validate workflow
        switch (type) {
            case CHECK_IN -> {
                if (hasIn || hasOut) {
                    throw conflict("Already checked in/out today.");
                }
            }
            case BREAK_OUT -> {
                if (!hasIn || hasOut) {
                    throw conflict("You must check in first.");
                }
                if (lastOpt.isPresent() && lastOpt.get().getEventType() == AttendanceEventType.BREAK_OUT) {
                    throw conflict("Already on a break.");
                }
            }
            case BREAK_IN -> {
                if (!hasIn || hasOut) {
                    throw conflict("You must check in first.");
                }
                if (lastOpt.isEmpty() || lastOpt.get().getEventType() != AttendanceEventType.BREAK_OUT) {
                    throw conflict("You are not currently on a break.");
                }
            }
            case CHECK_OUT -> {
                if (!hasIn) {
                    throw conflict("You must check in first.");
                }
                if (hasOut) {
                    throw conflict("Already checked out today.");
                }
                if (lastOpt.isPresent() && lastOpt.get().getEventType() == AttendanceEventType.BREAK_OUT) {
                    throw conflict("End the break before checking out.");
                }
            }
        }

        // Persist event (eventDate is set by @PrePersist on entity)
        var ev = new AttendanceEvent();
        ev.setEmployee(emp);
        ev.setEventType(type);
        ev.setTimestamp(now);
        evtRepo.save(ev);
        // No need to recompute summaries here; your read query aggregates from events.
    }

    /* ------------- read side ------------- */
    @Transactional(readOnly = true)
    public List<DailyAttendanceDto> summary(Integer empId, YearMonth ym) {
        LocalDate from = ym.atDay(1);
        LocalDate to   = ym.atEndOfMonth();
        return evtRepo.findDailySummary(empId, from, to)
                .stream()
                .map(this::toDto)
                .toList();
    }

    private DailyAttendanceDto toDto(Object[] row) {
        return new DailyAttendanceDto(
                ((java.sql.Date)      row[1]).toLocalDate(),
                row[2] == null ? null : ((java.sql.Timestamp) row[2]).toLocalDateTime(),
                row[3] == null ? null : ((java.sql.Timestamp) row[3]).toLocalDateTime(),
                ((Number)             row[4]).intValue(),
                ((Number)             row[5]).intValue());
    }

    @Transactional(readOnly = true)
    public AttendanceStateDto stateForToday(Integer empId) {
        LocalDate today = LocalDate.now();

        var lastOpt = evtRepo.findTopByEmployee_EmployeeIdAndEventDateOrderByTimestampDesc(empId, today);
        boolean hasIn  = evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(empId, today, AttendanceEventType.CHECK_IN);
        boolean hasOut = evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(empId, today, AttendanceEventType.CHECK_OUT);

        boolean checkedIn = hasIn && !hasOut;
        boolean onBreak = checkedIn
                && lastOpt.map(AttendanceEvent::getEventType)
                .filter(t -> t == AttendanceEventType.BREAK_OUT)
                .isPresent();

        boolean canCheckIn  = !hasIn;
        boolean canBreakOut = checkedIn && !onBreak;
        boolean canBreakIn  = checkedIn && onBreak;
        boolean canCheckOut = checkedIn && !onBreak;

        return new AttendanceStateDto(checkedIn, onBreak, canCheckIn, canBreakOut, canBreakIn, canCheckOut);
    }

    private RuntimeException conflict(String msg) {
        // Replace with a custom exception mapped to 409 if you have one
        return new IllegalStateException(msg);
    }
}
