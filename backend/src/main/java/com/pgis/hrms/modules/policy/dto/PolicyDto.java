package com.pgis.hrms.modules.policy.dto;

import com.pgis.hrms.modules.policy.model.PolicyStatus;
import java.time.*;

public record PolicyDto(Integer id, String title, LocalDate effectiveDate, PolicyStatus status) {}
