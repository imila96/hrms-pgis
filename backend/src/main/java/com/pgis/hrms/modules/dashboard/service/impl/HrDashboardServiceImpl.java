package com.pgis.hrms.modules.dashboard.service.impl;

import com.pgis.hrms.core.employee.dto.EmployeeDto;
import com.pgis.hrms.core.employee.dto.EmployeeSummaryDto;
import com.pgis.hrms.core.employee.service.EmployeeService;
import com.pgis.hrms.modules.announcement.dto.AnnouncementDto;
import com.pgis.hrms.modules.announcement.service.AnnouncementService;
import com.pgis.hrms.modules.attendance.dto.DailyAttendanceDto;
import com.pgis.hrms.modules.attendance.model.AttendanceEventType;
import com.pgis.hrms.modules.attendance.repository.AttendanceEventRepository;
import com.pgis.hrms.modules.attendance.service.AttendanceService;
import com.pgis.hrms.modules.dashboard.dto.HrDashboardSummaryDto;
import com.pgis.hrms.modules.dashboard.service.HrDashboardService;
import com.pgis.hrms.modules.leave.dto.LeaveBalanceDto;
import com.pgis.hrms.modules.leave.service.LeaveService;
import com.pgis.hrms.modules.recruitment.service.JobOpeningService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HrDashboardServiceImpl implements HrDashboardService {

    private final EmployeeService employeeService;
    private final AttendanceService attendanceService;
    private final AttendanceEventRepository attendanceEventRepository;
    private final JobOpeningService jobOpeningService;
    private final AnnouncementService announcementService;
    private final LeaveService leaveService;

    @Override
    public HrDashboardSummaryDto getHrDashboardSummary() {
        EmployeeDto me = employeeService.getMyProfile();

        // total staff
        List<EmployeeSummaryDto> summaries = employeeService.getEmployeeSummaries();
        int totalStaff = summaries == null ? 0 : summaries.size();

        // open positions
        int openPositions = jobOpeningService.getAllOpenings() == null ? 0 : jobOpeningService.getAllOpenings().size();

        // announcements (latest 3)
        List<AnnouncementDto> announcements = announcementService.listPublished()
                .stream().limit(3).collect(Collectors.toList());

        // org attendance rate (today)
        long presentToday = attendanceEventRepository.countDistinctEmployeesByEventDateAndEventType(LocalDate.now(), AttendanceEventType.CHECK_IN);
        double orgRate = totalStaff == 0 ? 0.0 : ((double) presentToday) / totalStaff;

        // user attendance rate (month) - simple heuristic: days with a check-in / days in month
        Double userRate = 0.0;
        Integer empId = me != null ? me.getId() : null;
        if (empId != null) {
            List<DailyAttendanceDto> diary = attendanceService.summary(empId, YearMonth.now());
            long daysPresent = diary == null ? 0 : diary.stream().filter(d -> d.firstIn() != null).count();
            int daysInMonth = YearMonth.now().lengthOfMonth();
            userRate = daysInMonth == 0 ? 0.0 : ((double) daysPresent) / daysInMonth;
        }

        // leave balances for current year
        List<LeaveBalanceDto> leaveBalances = empId == null ? List.of() : leaveService.balances(empId, Year.now().getValue());

        return HrDashboardSummaryDto.builder()
                .employeeId(me == null ? null : me.getId())
                .department(me == null ? null : null) // department may be available in summary; keep null if unknown
                .leaveBalances(leaveBalances)
                .userAttendanceRate(userRate)
                .totalStaff(totalStaff)
                .orgAttendanceRate(orgRate)
                .openPositions(openPositions)
                .announcements(announcements)
                .fetchedAt(Instant.now())
                .build();
    }
}
