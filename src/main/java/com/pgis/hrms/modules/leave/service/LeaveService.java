package com.pgis.hrms.modules.leave.service;

import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.leave.dto.*;
import com.pgis.hrms.modules.leave.model.*;
import com.pgis.hrms.modules.leave.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.time.*;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final EmployeeRepository       empRepo;
    private final LeaveApplicationRepository appRepo;
    private final LeaveBalanceRepository   balRepo;

    // === company policy constants ===
    private static final int ANNUAL_ENTITLEMENT = 14;
    private static final int SICK_ENTITLEMENT   = 14;
    private static final int CASUAL_ENTITLEMENT = 7;

    // ----- employee API -----

    @Transactional
    public void apply(Integer empId, ApplyLeaveRequest in, MultipartFile medicalFile) {
        Employee emp = empRepo.findById(empId).orElseThrow();
        int days = workingDays(in.startDate(), in.endDate());
        int year = in.startDate().getYear();

        // probation accrual rule for ANNUAL leave
        if (in.type() == LeaveType.ANNUAL && isOnProbation(emp)) {
            int earned = probationDaysEarned(emp.getHireDate(), in.startDate());
            ensureBalanceRow(emp, LeaveType.ANNUAL, year, earned);
        }

        // ensure balance exists (creates if missing with default entitlement)
        var bal = ensureBalanceRow(emp, in.type(), year, defaultEntitlement(in.type()));

        // medical slip rule
        if (in.type()==LeaveType.SICK && days>2 && (medicalFile==null || medicalFile.isEmpty()))
            throw new RuntimeException("Medical certificate required for sick leave > 2 days");

        if (bal.remaining() < days)
            throw new RuntimeException("Insufficient balance");

        // persist application
        LeaveApplication app = new LeaveApplication();
        app.setEmployee(emp);
        app.setLeaveType(in.type());
        app.setStartDate(in.startDate());
        app.setEndDate(in.endDate());
        app.setReason(in.reason());

        if (medicalFile!=null && !medicalFile.isEmpty()) {
            // TODO save to S3/minio and set URL
            app.setMedicalDocUrl("/mock/path/"+medicalFile.getOriginalFilename());
        }
        appRepo.save(app);
    }


    // HR approves or rejects
    @Transactional
    public void decide(Integer leaveId, boolean approve, Integer hrUserId) {
        var app = appRepo.findById(leaveId).orElseThrow();
        if (app.getStatus()!=LeaveStatus.PENDING)
            throw new RuntimeException("Already decided");

        app.setStatus(approve ? LeaveStatus.APPROVED : LeaveStatus.REJECTED);
        app.setDecidedAt(LocalDateTime.now());
        app.setDecidedBy(hrUserId);

        if (approve) {
            int days = workingDays(app.getStartDate(), app.getEndDate());
            int year = app.getStartDate().getYear();
            var bal = balRepo.findByEmployeeEmployeeIdAndLeaveTypeAndYear(
                    app.getEmployee().getEmployeeId(), app.getLeaveType(), year).orElseThrow();
            bal.setTaken(bal.getTaken()+days);
        }
    }

    // balance view
    @Transactional(readOnly = true)
    public List<LeaveBalanceDto> balances(Integer empId, int year) {
        return balRepo.findByEmployeeEmployeeIdAndYear(empId, year)
                .stream()
                .map(b -> new LeaveBalanceDto(b.getLeaveType(), b.getEntitled(), b.getTaken(), b.remaining()))
                .toList();
    }

    // ----- helpers -----

    private LeaveBalance ensureBalanceRow(Employee emp, LeaveType type, int year, int entitlement) {
        return balRepo.findByEmployeeEmployeeIdAndLeaveTypeAndYear(emp.getEmployeeId(), type, year)
                .orElseGet(() -> {
                    LeaveBalance nb = new LeaveBalance();
                    nb.setEmployee(emp);
                    nb.setLeaveType(type);
                    nb.setYear(year);
                    nb.setEntitled(entitlement);
                    nb.setTaken(0);
                    return balRepo.save(nb);
                });
    }

    private int defaultEntitlement(LeaveType t) {
        return switch (t) {
            case ANNUAL -> ANNUAL_ENTITLEMENT;
            case SICK   -> SICK_ENTITLEMENT;
            case CASUAL -> CASUAL_ENTITLEMENT;
        };
    }

    private boolean isOnProbation(Employee e) {
        return Period.between(e.getHireDate(), LocalDate.now()).getMonths() < 6; // 6‑month probation
    }

    private int probationDaysEarned(LocalDate hireDate, LocalDate asOf) {
        long months = ChronoUnit.MONTHS.between(hireDate.withDayOfMonth(1), asOf.withDayOfMonth(1));
        return (int) (months * 0.5);  // ½ day per month
    }

    private int workingDays(LocalDate from, LocalDate to) {
        int days = 0;
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            if (!(d.getDayOfWeek()==DayOfWeek.SATURDAY || d.getDayOfWeek()==DayOfWeek.SUNDAY))
                days++;
        }
        return days;
    }
}
