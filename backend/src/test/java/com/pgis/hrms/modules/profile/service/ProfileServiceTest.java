package com.pgis.hrms.modules.profile.service;

import com.pgis.hrms.core.auth.entity.User;
import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.profile.dto.EmployeeAdminUpdateRequest;
import com.pgis.hrms.modules.profile.dto.EmployeeProfileDto;
import com.pgis.hrms.modules.profile.dto.ProfileUpdateRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProfileServiceTest {

    @Mock
    private UserRepository userRepo;

    @Mock
    private EmployeeRepository empRepo;

    @InjectMocks
    private ProfileService profileService;

    private User testUser;
    private Employee testEmployee;

    @BeforeEach
    void setUp() {
        testEmployee = new Employee();
        testEmployee.setEmployeeId(1);
        testEmployee.setName("John Doe");
        testEmployee.setEmail("john.doe@example.com");
        testEmployee.setGender("Male");
        testEmployee.setDateOfBirth(LocalDate.of(1990, 1, 1));
        testEmployee.setNationality("USA");
        testEmployee.setNicNo("123456789V");

        testUser = new User();
        testUser.setUserId(1);
        testUser.setEmail("john.doe@example.com");
        testUser.setEmployee(testEmployee);
        testUser.setActive(true);
        testUser.setVerified(true);
    }



    @Test
    void updateMyProfile_shouldUpdateEmployeeFields() {
        // Arrange
        ProfileUpdateRequest updateRequest = new ProfileUpdateRequest(
            "Female",
            LocalDate.of(1990, 5, 15),
            "Canada",
            "Single",
            "Christian",
            "O+",
            "new-profile.jpg"
        );

        when(userRepo.findByEmail("john.doe@example.com")).thenReturn(Optional.of(testUser));

        // Act
        EmployeeProfileDto result = profileService.updateMyProfile("john.doe@example.com", updateRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Female", testEmployee.getGender());
        assertEquals(LocalDate.of(1990, 5, 15), testEmployee.getDateOfBirth());
        assertEquals("Canada", testEmployee.getNationality());
        assertEquals("Single", testEmployee.getMaritalStatus());
        assertEquals("Christian", testEmployee.getReligion());
        assertEquals("O+", testEmployee.getBloodGroup());
        assertEquals("new-profile.jpg", testEmployee.getProfileImage());
    }



    @Test
    void adminUpdate_shouldUpdateEmployeeAndUserFields() {
        // Arrange
        EmployeeAdminUpdateRequest updateRequest = new EmployeeAdminUpdateRequest(
            "Jane Doe",
            "Female",
            LocalDate.of(1992, 3, 20),
            "UK",
            "987654321V",
            "Married",
            "Muslim",
            "A+",
            "admin-profile.jpg",
            false,
            false
        );

        when(empRepo.findById(1)).thenReturn(Optional.of(testEmployee));
        when(userRepo.findAll()).thenReturn(Arrays.asList(testUser));

        // Act
        EmployeeProfileDto result = profileService.adminUpdate(1, updateRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Jane Doe", testEmployee.getName());
        assertEquals("Female", testEmployee.getGender());
        assertEquals("UK", testEmployee.getNationality());
        assertEquals("987654321V", testEmployee.getNicNo());
        assertFalse(testUser.getActive());
        assertFalse(testUser.getVerified());
    }
}
