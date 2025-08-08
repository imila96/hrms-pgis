package com.pgis.hrms.modules.recruitment.dto;

import java.time.LocalDate;

public record JobOpeningDto(Long jobOpeningId, LocalDate jobOpeningDate, Boolean active) {
}
