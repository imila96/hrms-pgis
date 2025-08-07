package com.pgis.hrms.core.attendance.dto;

import java.time.*;

public record DailyAttendanceDto(
        LocalDate        workDate,
        LocalDateTime    firstIn,
        LocalDateTime    lastOut,
        int              breakMinutes,
        int              paidMinutes) {}