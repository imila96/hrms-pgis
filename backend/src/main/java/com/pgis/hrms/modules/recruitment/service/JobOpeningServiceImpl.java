package com.pgis.hrms.modules.recruitment.service;


import com.pgis.hrms.modules.announcement.dto.AnnouncementDetailDto;
import com.pgis.hrms.modules.recruitment.model.JobOpening;
import com.pgis.hrms.modules.recruitment.repository.JobOpeningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class JobOpeningServiceImpl implements JobOpeningService {
    @Autowired
    private JobOpeningRepository jobOpeningRepository;

    public List<JobOpening> getAllOpenings() {
        return jobOpeningRepository.findAll();
    }

    public JobOpening createOpening(JobOpening jobOpening) {
        jobOpening.setPostedDate(LocalDate.now());
        jobOpening.setActive(true);
        return jobOpeningRepository.save(jobOpening);
    }

    public void closeOpening(Long id) {
        JobOpening opening = jobOpeningRepository.findById(id).orElseThrow();
        opening.setActive(false);
        jobOpeningRepository.save(opening);
    }

}
