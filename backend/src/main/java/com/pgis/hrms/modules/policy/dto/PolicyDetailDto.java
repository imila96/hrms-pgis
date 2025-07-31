package com.pgis.hrms.modules.policy.dto;

import com.pgis.hrms.modules.policy.model.PolicyStatus;
import java.time.*;

public record PolicyDetailDto(Integer id,
                              String  title,
                              String  description,
                              LocalDate effectiveDate,
                              PolicyStatus status,
                              String  createdBy,
                              String  decidedBy,
                              LocalDateTime decidedAt) {}