package com.pgis.hrms.modules.dashboard.service.impl;

import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.dashboard.dto.DirectorDashboardSummaryDto;
import com.pgis.hrms.modules.dashboard.service.DirectorDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class DirectorDashboardServiceImpl implements DirectorDashboardService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Override
    public DirectorDashboardSummaryDto getDirectorDashboardSummary() {
        // Get actual counts from database
        long totalEmployees = employeeRepository.count();
        long totalUsers = userRepository.count();
        
        // Placeholder values for departments and pending reports
        // These can be implemented later with proper repositories
        int totalDepartments = 6; // Placeholder - can be replaced with actual department count
        int pendingReports = 12; // Placeholder - can be replaced with actual report count
        
        return DirectorDashboardSummaryDto.builder()
                .totalEmployees((int) totalEmployees)
                .totalUsers((int) totalUsers)
                .totalDepartments(totalDepartments)
                .pendingReports(pendingReports)
                .fetchedAt(Instant.now())
                .build();
    }
}
