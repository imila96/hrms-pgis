package com.pgis.hrms.modules.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DirectorDashboardSummaryDto {
    // Employee and User counts
    private Integer totalEmployees;
    private Integer totalUsers;
    
    // Department overview
    private Integer totalDepartments;
    private Integer pendingReports;
    
    // Metadata
    private Instant fetchedAt;
}
