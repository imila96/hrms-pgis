package com.pgis.hrms.modules.recruitment.service;

import com.pgis.hrms.modules.recruitment.dto.JobOpeningDto;
import com.pgis.hrms.modules.recruitment.model.JobOpening;
import com.pgis.hrms.modules.recruitment.repository.JobOpeningRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobOpeningServiceImpl implements JobOpeningService {
    @Autowired
    private JobOpeningRepository jobOpeningRepository;

    @Override
    public List<JobOpeningDto> getAllOpenings() {
        return jobOpeningRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public JobOpeningDto createOpening(JobOpeningDto jobOpeningDto) {
        JobOpening entity = new JobOpening();
        entity.setTitle(jobOpeningDto.title());
        entity.setDescription(jobOpeningDto.description());
        entity.setDepartment(jobOpeningDto.department());
        // postedDate & status are set by the service
        entity.setPostedDate(LocalDate.now());
        entity.setStatus("Open");
        JobOpening saved = jobOpeningRepository.save(entity);
        return toDto(saved);
    }

    @Override
    public void closeOpening(Long id) {
    JobOpening opening = jobOpeningRepository.findById(id).orElseThrow();
    opening.setStatus("Closed");
        jobOpeningRepository.save(opening);
    }

    private JobOpeningDto toDto(JobOpening j) {
        return new JobOpeningDto(
                j.getId(),
                j.getTitle(),
                j.getDescription(),
                j.getDepartment(),
                j.getPostedDate(),
        j.getStatus()
        );
    }

}
