package com.pgis.hrms.modules.recruitment.service;


import com.pgis.hrms.modules.recruitment.model.JobOpening;

import java.util.List;

public interface JobOpeningService {
    List<JobOpening> getAllOpenings();

    JobOpening createOpening(JobOpening jobOpening);

    void closeOpening(Long id);
}
