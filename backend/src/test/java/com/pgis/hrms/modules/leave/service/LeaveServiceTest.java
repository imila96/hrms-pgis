package com.pgis.hrms.modules.leave.service;

import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.entity.Employment;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.core.employee.repository.EmploymentRepository;
import com.pgis.hrms.modules.leave.config.LeaveConfig;
import com.pgis.hrms.modules.leave.dto.ApplyLeaveRequest;
import com.pgis.hrms.modules.leave.dto.LeaveBalanceDto;
import com.pgis.hrms.modules.leave.model.*;
import com.pgis.hrms.modules.leave.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock
    private LeaveConfig leaveConfig;

    @Mock
    private EmployeeRepository empRepo;

    @Mock
    private EmploymentRepository emptRepo;

    @Mock
    private LeaveApplicationRepository appRepo;

    @Mock
    private LeaveBalanceRepository balRepo;

    @InjectMocks
    private LeaveService leaveService;

    private Employee testEmployee;
    private LeaveBalance testBalance;
    private LeaveApplication testApplication;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setName("John Doe");

        testBalance = new LeaveBalance();
        testBalance.setEmployee(testEmployee);
        testBalance.setLeaveType(LeaveType.ANNUAL);
        testBalance.setYear(LocalDate.now().getYear());
        testBalance.setEntitled(14);
        testBalance.setTaken(0);

        testApplication = new LeaveApplication();
        testApplication.setLeaveId(1);
        testApplication.setEmployee(testEmployee);
        testApplication.setLeaveType(LeaveType.ANNUAL);
        testApplication.setStartDate(LocalDate.now().plusDays(1));
        testApplication.setEndDate(LocalDate.now().plusDays(3));
        testApplication.setStatus(LeaveStatus.PENDING);
    }







    @Test
    void withdraw_withPendingLeave_shouldCancelSuccessfully() {
        // Arrange
        when(appRepo.findById(1)).thenReturn(Optional.of(testApplication));
        when(appRepo.save(any(LeaveApplication.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        leaveService.withdraw(1, 1);

        // Assert
        assertEquals(LeaveStatus.CANCELLED, testApplication.getStatus());
        verify(appRepo).save(testApplication);
    }

    @Test
    void withdraw_withApprovedLeave_shouldCancelAndRestoreBalance() {
        // Arrange
        testApplication.setStatus(LeaveStatus.APPROVED);
        when(appRepo.findById(1)).thenReturn(Optional.of(testApplication));
        when(balRepo.findByEmployeeEmployeeIdAndLeaveTypeAndYear(1, LeaveType.ANNUAL, LocalDate.now().getYear()))
            .thenReturn(Optional.of(testBalance));
        when(appRepo.save(any(LeaveApplication.class))).thenAnswer(i -> i.getArgument(0));
        when(balRepo.save(any(LeaveBalance.class))).thenAnswer(i -> i.getArgument(0));

        testBalance.setTaken(3); // 3 days were taken

        // Act
        leaveService.withdraw(1, 1);

        // Assert
        assertEquals(LeaveStatus.CANCELLED, testApplication.getStatus());
        assertEquals(0, testBalance.getTaken()); // Balance restored
        verify(balRepo).save(testBalance);
    }

    @Test
    void decide_approveLeave_shouldUpdateStatusAndBalance() {
        // Arrange
        when(appRepo.findById(1)).thenReturn(Optional.of(testApplication));
        when(balRepo.findByEmployeeEmployeeIdAndLeaveTypeAndYear(1, LeaveType.ANNUAL, LocalDate.now().getYear()))
            .thenReturn(Optional.of(testBalance));

        // Act
        leaveService.decide(1, true, 100);

        // Assert
        assertEquals(LeaveStatus.APPROVED, testApplication.getStatus());
        assertEquals(3, testBalance.getTaken()); // 3 days deducted
        assertNotNull(testApplication.getDecidedAt());
        assertEquals(100, testApplication.getDecidedBy());
    }

    @Test
    void decide_rejectLeave_shouldUpdateStatusOnly() {
        // Arrange
        when(appRepo.findById(1)).thenReturn(Optional.of(testApplication));

        // Act
        leaveService.decide(1, false, 100);

        // Assert
        assertEquals(LeaveStatus.REJECTED, testApplication.getStatus());
        assertEquals(0, testBalance.getTaken()); // Balance not changed
        assertNotNull(testApplication.getDecidedAt());
    }

    @Test
    void balances_shouldReturnAllLeaveBalances() {
        // Arrange
        Map<LeaveType, Integer> entitlements = new HashMap<>();
        entitlements.put(LeaveType.ANNUAL, 14);
        entitlements.put(LeaveType.SICK, 14);
        entitlements.put(LeaveType.CASUAL, 7);

        when(leaveConfig.getEntitlements()).thenReturn(entitlements);
        when(empRepo.getReferenceById(1)).thenReturn(testEmployee);
        when(balRepo.findByEmployeeEmployeeIdAndYear(1, LocalDate.now().getYear()))
            .thenReturn(Collections.singletonList(testBalance));
        when(balRepo.save(any(LeaveBalance.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        List<LeaveBalanceDto> result = leaveService.balances(1, LocalDate.now().getYear());

        // Assert
        assertNotNull(result);
        assertTrue(result.size() >= 1);
    }
}
