package com.pgis.hrms.modules.recruitment.service;

import com.pgis.hrms.modules.recruitment.dto.JobOpeningDto;

import java.util.List;

public interface JobOpeningService {
    List<JobOpeningDto> getAllOpenings();

    JobOpeningDto createOpening(JobOpeningDto jobOpeningDto);

    void closeOpening(Long id);
}
