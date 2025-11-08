package com.pgis.hrms.modules.dashboard.service.impl;

import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import com.pgis.hrms.modules.dashboard.dto.AdminDashboardSummaryDto;
import com.pgis.hrms.modules.dashboard.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;

    @Override
    public AdminDashboardSummaryDto getAdminDashboardSummary() {
        // Get actual counts from database
        long totalEmployees = employeeRepository.count();
        long totalUsers = userRepository.count();
        
        // Placeholder values for system logs and pending issues
        // These can be implemented later with proper repositories
        int systemLogs = 1289; // Placeholder - can be replaced with actual log count
        int pendingIssues = 8; // Placeholder - can be replaced with actual issue count
        
        return AdminDashboardSummaryDto.builder()
                .totalEmployees((int) totalEmployees)
                .totalUsers((int) totalUsers)
                .systemLogs(systemLogs)
                .pendingIssues(pendingIssues)
                .fetchedAt(Instant.now())
                .build();
    }
}
