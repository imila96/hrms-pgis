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
public class AdminDashboardSummaryDto {
    // Employee and User counts
    private Integer totalEmployees;
    private Integer totalUsers;
    
    // System overview
    private Integer systemLogs;
    private Integer pendingIssues;
    
    // Metadata
    private Instant fetchedAt;
}
