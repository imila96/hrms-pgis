package com.pgis.hrms.modules.attendance.dto;

public record AttendanceStateDto(
        boolean checkedIn,
        boolean onBreak,
        boolean canCheckIn,
        boolean canBreakOut,
        boolean canBreakIn,
        boolean canCheckOut
) {}
