package com.pgis.hrms.modules.leave.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pgis.hrms.modules.leave.model.LeaveType;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.*;

public record ApplyLeaveRequest(
        @JsonProperty("startDate") LocalDate startDate,
        @JsonProperty("endDate")   LocalDate endDate,
        LeaveType type,
        String reason) {}