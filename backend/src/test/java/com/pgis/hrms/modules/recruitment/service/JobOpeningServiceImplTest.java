package com.pgis.hrms.modules.recruitment.service;

import com.pgis.hrms.modules.recruitment.dto.JobOpeningDto;
import com.pgis.hrms.modules.recruitment.model.JobOpening;
import com.pgis.hrms.modules.recruitment.repository.JobOpeningRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobOpeningServiceImplTest {

    @Mock
    private JobOpeningRepository jobOpeningRepository;

    @InjectMocks
    private JobOpeningServiceImpl jobOpeningService;

    private JobOpening testJobOpening;
    private JobOpeningDto testJobOpeningDto;

    @BeforeEach
    void setUp() {
        testJobOpening = new JobOpening();
        testJobOpening.setId(1L);
        testJobOpening.setTitle("Software Engineer");
        testJobOpening.setDescription("Java Developer position");
        testJobOpening.setDepartment("IT");
        testJobOpening.setPostedDate(LocalDate.now());
        testJobOpening.setStatus("Open");

        testJobOpeningDto = new JobOpeningDto(
            1L,
            "Software Engineer",
            "Java Developer position",
            "IT",
            LocalDate.now(),
            "Open"
        );
    }

    @Test
    void getAllOpenings_shouldReturnAllJobOpenings() {
        // Arrange
        List<JobOpening> jobOpenings = Arrays.asList(testJobOpening);
        when(jobOpeningRepository.findAll()).thenReturn(jobOpenings);

        // Act
        List<JobOpeningDto> result = jobOpeningService.getAllOpenings();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Software Engineer", result.get(0).title());
        assertEquals("IT", result.get(0).department());
        verify(jobOpeningRepository).findAll();
    }

    @Test
    void createOpening_shouldCreateJobOpeningWithDefaultValues() {
        // Arrange
        JobOpeningDto inputDto = new JobOpeningDto(
            null,
            "Software Engineer",
            "Java Developer position",
            "IT",
            null,
            null
        );

        when(jobOpeningRepository.save(any(JobOpening.class))).thenReturn(testJobOpening);

        // Act
        JobOpeningDto result = jobOpeningService.createOpening(inputDto);

        // Assert
        assertNotNull(result);
        assertEquals("Software Engineer", result.title());
        assertEquals("Open", result.status());
        assertNotNull(result.postedDate());
        verify(jobOpeningRepository).save(any(JobOpening.class));
    }

    @Test
    void closeOpening_shouldUpdateStatusToClosed() {
        // Arrange
        when(jobOpeningRepository.findById(1L)).thenReturn(Optional.of(testJobOpening));
        when(jobOpeningRepository.save(any(JobOpening.class))).thenReturn(testJobOpening);

        // Act
        jobOpeningService.closeOpening(1L);

        // Assert
        assertEquals("Closed", testJobOpening.getStatus());
        verify(jobOpeningRepository).findById(1L);
        verify(jobOpeningRepository).save(testJobOpening);
    }
}
