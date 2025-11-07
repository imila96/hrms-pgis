package com.pgis.hrms.modules.recruitment.dto;

import java.time.LocalDate;

/**
 * DTO representing a job opening exchanged via controller APIs.
 */
public record JobOpeningDto(
	Long id,
	String title,
	String description,
	String department,
	LocalDate postedDate,
	String status
) {
}
