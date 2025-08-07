package com.pgis.hrms.core.attendance.service;

import com.pgis.hrms.core.attendance.dto.DailyAttendanceDto;
import com.pgis.hrms.core.attendance.model.AttendanceEvent;
import com.pgis.hrms.core.attendance.model.AttendanceEventType;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.attendance.model.*;
import com.pgis.hrms.core.attendance.repository.AttendanceEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceEventRepository evtRepo;
    private final EmployeeRepository        empRepo;

    /* ------------- write side ------------- */
    @Transactional
    public void punch(Integer employeeId,
                      AttendanceEventType type,
                      LocalDateTime when) {
        var emp = empRepo.findById(employeeId).orElseThrow();
        AttendanceEvent ev = new AttendanceEvent();
        ev.setEmployee(emp);
        ev.setEventType(type);
        ev.setTimestamp(when == null ? LocalDateTime.now() : when);
        // evt_date set by @PrePersist
        evtRepo.save(ev);
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
                ((java.sql.Timestamp) row[2]).toLocalDateTime(),
                ((java.sql.Timestamp) row[3]).toLocalDateTime(),
                ((Number)             row[4]).intValue(),
                ((Number)             row[5]).intValue());
    }
}