package com.pgis.hrms.modules.leave.service;

import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.entity.Employment;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.core.employee.repository.EmploymentRepository;
import com.pgis.hrms.modules.leave.config.LeaveConfig;
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
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private final LeaveConfig leaveConfig;

    private final EmployeeRepository       empRepo;

    private final EmploymentRepository emptRepo;

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
        
        // Validation 1: Don't allow past dates
        if (in.startDate().isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot apply for leave with past dates. Start date must be today or in the future.");
        }
        
        // Validation: End date must be after or equal to start date
        if (in.endDate().isBefore(in.startDate())) {
            throw new RuntimeException("End date cannot be before start date.");
        }
        
        // Get employment record (optional - may not exist for newly created employees)
        Optional<Employment> emptOpt = emptRepo.findFirstByEmployeeEmployeeIdOrderByDateOfJoiningAsc(empId);
        
        int days = workingDays(in.startDate(), in.endDate());
        int year = in.startDate().getYear();

        // Validation 2: Check for overlapping leaves (approved or pending)
        List<LeaveApplication> existingLeaves = appRepo.findByEmployeeEmployeeIdAndStartDateBetween(
            empId, 
            in.startDate().minusDays(365), // Check within a reasonable range
            in.endDate().plusDays(365)
        );
        
        for (LeaveApplication existing : existingLeaves) {
            // Only check approved and pending leaves
            if (existing.getStatus() == LeaveStatus.APPROVED || existing.getStatus() == LeaveStatus.PENDING) {
                // Check if dates overlap
                boolean overlaps = !(in.endDate().isBefore(existing.getStartDate()) || 
                                    in.startDate().isAfter(existing.getEndDate()));
                if (overlaps) {
                    throw new RuntimeException(
                        String.format("Leave dates overlap with an existing %s leave from %s to %s", 
                            existing.getStatus().toString().toLowerCase(),
                            existing.getStartDate(),
                            existing.getEndDate())
                    );
                }
            }
        }

        // probation accrual rule for ANNUAL leave (only if employment record exists)
        if (in.type() == LeaveType.ANNUAL && emptOpt.isPresent() && isOnProbation(emptOpt.get())) {
            int earned = probationDaysEarned(emptOpt.get().getDateOfJoining(), in.startDate());
            ensureBalanceRow(emp, LeaveType.ANNUAL, year, earned);
        }

        // ensure balance exists (creates if missing with default entitlement)
        var bal = ensureBalanceRow(emp, in.type(), year, defaultEntitlement(in.type()));

        // medical slip rule
        if (in.type()==LeaveType.SICK && days>2 && (medicalFile==null || medicalFile.isEmpty()))
            throw new RuntimeException("Medical certificate required for sick leave > 2 days");

        // Validation 3: Check if sufficient balance (this was already implemented)
        if (bal.remaining() < days) {
            throw new RuntimeException(
                String.format("Insufficient leave balance. You have %d days remaining but requested %d days.", 
                    bal.remaining(), days)
            );
        }

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


    // Employee withdraws their own leave request
    @Transactional
    public void withdraw(Integer leaveId, Integer empId) {
        var app = appRepo.findById(leaveId).orElseThrow(() -> 
            new RuntimeException("Leave application not found"));
        
        // Verify the leave belongs to this employee
        if (!app.getEmployee().getEmployeeId().equals(empId)) {
            throw new RuntimeException("Unauthorized: This leave request does not belong to you");
        }
        
        // Only PENDING or APPROVED leaves can be withdrawn
        if (app.getStatus() != LeaveStatus.PENDING && app.getStatus() != LeaveStatus.APPROVED) {
            throw new RuntimeException("Cannot withdraw: Leave is already " + app.getStatus());
        }
        
        // If the leave was APPROVED, we need to restore the balance
        if (app.getStatus() == LeaveStatus.APPROVED) {
            int days = workingDays(app.getStartDate(), app.getEndDate());
            int year = app.getStartDate().getYear();
            
            var balOpt = balRepo.findByEmployeeEmployeeIdAndLeaveTypeAndYear(
                    app.getEmployee().getEmployeeId(), app.getLeaveType(), year);
            
            if (balOpt.isPresent()) {
                LeaveBalance bal = balOpt.get();
                // Restore the days by reducing taken count
                bal.setTaken(Math.max(0, bal.getTaken() - days));
                balRepo.save(bal);
            }
        }
        
        // Mark as CANCELLED
        app.setStatus(LeaveStatus.CANCELLED);
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
    @Transactional
    public List<LeaveBalanceDto> balances(Integer empId, int year) {
        Employee emp = empRepo.getReferenceById(empId);

        // existing balances for this employee/year
        Map<LeaveType, LeaveBalance> existing = balRepo
                .findByEmployeeEmployeeIdAndYear(empId, year)
                .stream()
                .collect(Collectors.toMap(LeaveBalance::getLeaveType, Function.identity()));

        // seed missing & align entitlements from properties
        leaveConfig.getEntitlements().forEach((type, entitled) -> {
            LeaveBalance b = existing.get(type);
            if (b == null) {
                b = new LeaveBalance();
                b.setEmployee(emp);
                b.setLeaveType(type);
                b.setYear(year);
                b.setEntitled(entitled);
                b.setTaken(0);
                balRepo.save(b);
                existing.put(type, b);
            } else if (b.getEntitled() != entitled) {
                // optional: update if config changed
                b.setEntitled(entitled);
                balRepo.save(b);
            }
        });

        return existing.values().stream()
                .sorted(Comparator.comparing(LeaveBalance::getLeaveType))
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

    private boolean isOnProbation(Employment employment) {
        if (employment.getDateOfJoining() == null) {
            return false; // If no hire date, assume not on probation
        }
        return Period.between(employment.getDateOfJoining(), LocalDate.now()).getMonths() < 6; // 6‑month probation
    }

    private int probationDaysEarned(LocalDate hireDate, LocalDate asOf) {
        long months = ChronoUnit.MONTHS.between(hireDate.withDayOfMonth(1), asOf.withDayOfMonth(1));
        return (int) (months * 0.5);  // ½ day per month
    }

    private int workingDays(LocalDate from, LocalDate to) {
        // Count all days including weekends
        return (int) ChronoUnit.DAYS.between(from, to) + 1;
    }
}