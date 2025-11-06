package com.pgis.hrms.modules.dashboard.dto;

import com.pgis.hrms.modules.announcement.dto.AnnouncementDto;
import com.pgis.hrms.modules.leave.dto.LeaveBalanceDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HrDashboardSummaryDto {
    // basic user info
    private Integer employeeId;
    private String department;

    // per-user details
    private List<LeaveBalanceDto> leaveBalances;
    private Double userAttendanceRate; // 0..1

    // overview
    private Integer totalStaff;
    private Double orgAttendanceRate; // 0..1
    private Integer openPositions;

    // latest announcements
    private List<AnnouncementDto> announcements;

    // metadata
    private Instant fetchedAt;
}
