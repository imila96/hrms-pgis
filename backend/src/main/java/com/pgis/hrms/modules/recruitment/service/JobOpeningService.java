package com.pgis.hrms.modules.recruitment.service;

import com.pgis.hrms.modules.recruitment.dto.JobOpeningDto;

import java.util.List;

public interface JobOpeningService {
    List<JobOpeningDto> getAllOpenings();

    JobOpeningDto createOpening(JobOpeningDto jobOpeningDto);

    void closeOpening(Long id);
    
    /**
     * Decide a job opening — approve or reject. Implementations should set the status
     * to "Approved" when approve is true, or "Rejected" otherwise.
     */
    void decideOpening(Long id, boolean approve);
}
