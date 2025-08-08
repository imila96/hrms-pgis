package com.pgis.hrms.modules.leave.dto;

import com.pgis.hrms.modules.leave.model.LeaveStatus;
import com.pgis.hrms.modules.leave.model.LeaveType;

import java.time.LocalDate;

public record MyLeaveDto(
        Integer id,
        LeaveType type,
        LocalDate start,
        LocalDate end,
        LeaveStatus status,
        String reason
) {}
