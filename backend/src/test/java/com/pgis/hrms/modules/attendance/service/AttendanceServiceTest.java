package com.pgis.hrms.modules.attendance.service;

import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.attendance.dto.AttendanceStateDto;
import com.pgis.hrms.modules.attendance.model.AttendanceEvent;
import com.pgis.hrms.modules.attendance.model.AttendanceEventType;
import com.pgis.hrms.modules.attendance.repository.AttendanceEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceServiceTest {

    @Mock
    private AttendanceEventRepository evtRepo;

    @Mock
    private EmployeeRepository empRepo;

    @InjectMocks
    private AttendanceService attendanceService;

    private Employee testEmployee;
    private AttendanceEvent testEvent;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setName("John Doe");

        testEvent = new AttendanceEvent();
        testEvent.setEmployee(testEmployee);
        testEvent.setEventType(AttendanceEventType.CHECK_IN);
        testEvent.setTimestamp(LocalDateTime.now());
    }

    @Test
    void punch_checkIn_shouldCreateCheckInEvent() {
        // Arrange
        LocalDate today = LocalDate.now();
        when(empRepo.findById(1)).thenReturn(Optional.of(testEmployee));
        when(evtRepo.findTopByEmployee_EmployeeIdAndEventDateOrderByTimestampDesc(1, today))
            .thenReturn(Optional.empty());
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_IN))
            .thenReturn(false);
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_OUT))
            .thenReturn(false);
        when(evtRepo.save(any(AttendanceEvent.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        attendanceService.punch(1, AttendanceEventType.CHECK_IN, LocalDateTime.now());

        // Assert
        verify(evtRepo).save(any(AttendanceEvent.class));
    }

    @Test
    void punch_checkInTwice_shouldThrowException() {
        // Arrange
        LocalDate today = LocalDate.now();
        when(empRepo.findById(1)).thenReturn(Optional.of(testEmployee));
        when(evtRepo.findTopByEmployee_EmployeeIdAndEventDateOrderByTimestampDesc(1, today))
            .thenReturn(Optional.empty());
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_IN))
            .thenReturn(true);
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_OUT))
            .thenReturn(false);

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class,
            () -> attendanceService.punch(1, AttendanceEventType.CHECK_IN, LocalDateTime.now()));
        assertTrue(exception.getMessage().contains("Already checked in/out today"));
    }

    @Test
    void punch_breakOut_withoutCheckIn_shouldThrowException() {
        // Arrange
        LocalDate today = LocalDate.now();
        when(empRepo.findById(1)).thenReturn(Optional.of(testEmployee));
        when(evtRepo.findTopByEmployee_EmployeeIdAndEventDateOrderByTimestampDesc(1, today))
            .thenReturn(Optional.empty());
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_IN))
            .thenReturn(false);
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_OUT))
            .thenReturn(false);

        // Act & Assert
        IllegalStateException exception = assertThrows(IllegalStateException.class,
            () -> attendanceService.punch(1, AttendanceEventType.BREAK_OUT, LocalDateTime.now()));
        assertTrue(exception.getMessage().contains("You must check in first"));
    }

    @Test
    void punch_checkOut_afterCheckIn_shouldCreateCheckOutEvent() {
        // Arrange
        LocalDate today = LocalDate.now();
        testEvent.setEventType(AttendanceEventType.CHECK_IN);
        when(empRepo.findById(1)).thenReturn(Optional.of(testEmployee));
        when(evtRepo.findTopByEmployee_EmployeeIdAndEventDateOrderByTimestampDesc(1, today))
            .thenReturn(Optional.of(testEvent));
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_IN))
            .thenReturn(true);
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_OUT))
            .thenReturn(false);
        when(evtRepo.save(any(AttendanceEvent.class))).thenAnswer(i -> i.getArgument(0));

        // Act
        attendanceService.punch(1, AttendanceEventType.CHECK_OUT, LocalDateTime.now());

        // Assert
        verify(evtRepo).save(any(AttendanceEvent.class));
    }

    @Test
    void stateForToday_afterCheckIn_shouldReturnCorrectState() {
        // Arrange
        LocalDate today = LocalDate.now();
        testEvent.setEventType(AttendanceEventType.CHECK_IN);
        when(evtRepo.findTopByEmployee_EmployeeIdAndEventDateOrderByTimestampDesc(1, today))
            .thenReturn(Optional.of(testEvent));
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_IN))
            .thenReturn(true);
        when(evtRepo.existsByEmployee_EmployeeIdAndEventDateAndEventType(1, today, AttendanceEventType.CHECK_OUT))
            .thenReturn(false);

        // Act
        AttendanceStateDto state = attendanceService.stateForToday(1);

        // Assert
        assertTrue(state.checkedIn());
        assertFalse(state.onBreak());
        assertFalse(state.canCheckIn());
        assertTrue(state.canBreakOut());
        assertFalse(state.canBreakIn());
        assertTrue(state.canCheckOut());
    }

    @Test
    void todaysCounts_shouldReturnCorrectCounts() {
        // Arrange
        LocalDate today = LocalDate.now();
        when(evtRepo.countDistinctEmployeesByEventDateAndEventType(today, AttendanceEventType.CHECK_IN))
            .thenReturn(5L);
        when(empRepo.count()).thenReturn(10L);

        // Act
        Map<String, Long> counts = attendanceService.todaysCounts();

        // Assert
        assertEquals(5L, counts.get("present"));
        assertEquals(5L, counts.get("absent"));
        assertEquals(0L, counts.get("onLeave"));
        assertEquals(0L, counts.get("late"));
    }
}
