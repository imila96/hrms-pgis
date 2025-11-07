package com.pgis.hrms.core.employee.service;

import com.pgis.hrms.core.employee.dto.EmployeeDto;
import com.pgis.hrms.core.employee.dto.EmployeeRequest;
import com.pgis.hrms.core.employee.dto.EmployeeSummaryDto;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.mapper.EmployeeMapper;
import com.pgis.hrms.core.employee.mapper.ContactMapper;
import com.pgis.hrms.core.employee.mapper.EmploymentMapper;
import com.pgis.hrms.core.employee.mapper.CompensationMapper;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.core.employee.repository.ContactRepository;
import com.pgis.hrms.core.employee.repository.EmploymentRepository;
import com.pgis.hrms.core.employee.repository.CompensationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private EmploymentRepository employmentRepository;

    @Mock
    private CompensationRepository compensationRepository;

    @Mock
    private ContactMapper contactMapper;

    @Mock
    private EmploymentMapper employmentMapper;

    @Mock
    private CompensationMapper compensationMapper;

    @InjectMocks
    private EmployeeServiceImpl employeeService;

    private Employee testEmployee;
    private EmployeeDto testEmployeeDto;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setName("John Doe");
        testEmployee.setEmail("john.doe@example.com");

        testEmployeeDto = new EmployeeDto();
        testEmployeeDto.setId(1);
        testEmployeeDto.setName("John Doe");
        testEmployeeDto.setEmail("john.doe@example.com");
    }

    @Test
    void createEmployee_withUniqueEmail_shouldCreateSuccessfully() {
        // Arrange
        when(employeeRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.empty());
        when(employeeMapper.toEntity(testEmployeeDto)).thenReturn(testEmployee);
        when(employeeRepository.save(testEmployee)).thenReturn(testEmployee);
        when(employeeMapper.toDto(testEmployee)).thenReturn(testEmployeeDto);

        // Act
        EmployeeDto result = employeeService.createEmployee(testEmployeeDto);

        // Assert
        assertNotNull(result);
        assertEquals("John Doe", result.getName());
        verify(employeeRepository).findByEmail("john.doe@example.com");
        verify(employeeRepository).save(testEmployee);
    }

    @Test
    void createEmployee_withDuplicateEmail_shouldThrowException() {
        // Arrange
        when(employeeRepository.findByEmail("john.doe@example.com")).thenReturn(Optional.of(testEmployee));

        // Act & Assert
        ResponseStatusException exception = assertThrows(ResponseStatusException.class,
            () -> employeeService.createEmployee(testEmployeeDto));
        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals("Email already in use", exception.getReason());
        verify(employeeRepository, never()).save(any());
    }

    @Test
    void getAllEmployees_shouldReturnAllEmployees() {
        // Arrange
        List<Employee> employees = Arrays.asList(testEmployee);
        when(employeeRepository.findAll()).thenReturn(employees);
        when(employeeMapper.toDto(testEmployee)).thenReturn(testEmployeeDto);

        // Act
        List<EmployeeDto> result = employeeService.getAllEmployees();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("John Doe", result.get(0).getName());
        verify(employeeRepository).findAll();
    }

    @Test
    void getEmployeeById_withExistingId_shouldReturnEmployee() {
        // Arrange
        when(employeeRepository.findById(1)).thenReturn(Optional.of(testEmployee));
        when(employeeMapper.toDto(testEmployee)).thenReturn(testEmployeeDto);

        // Act
        EmployeeDto result = employeeService.getEmployeeById(1);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals("John Doe", result.getName());
        verify(employeeRepository).findById(1);
    }
}
