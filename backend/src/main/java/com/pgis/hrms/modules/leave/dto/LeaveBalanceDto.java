package com.pgis.hrms.modules.leave.dto;

import com.pgis.hrms.modules.leave.model.LeaveType;

public record LeaveBalanceDto(LeaveType type, int entitled, int taken, int remaining) {}