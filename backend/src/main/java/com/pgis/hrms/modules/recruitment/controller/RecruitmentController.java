package com.pgis.hrms.modules.recruitment.controller;

import com.pgis.hrms.modules.recruitment.dto.JobOpeningDto;
import com.pgis.hrms.modules.recruitment.service.JobOpeningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hr/recruitment")
public class RecruitmentController {

    @Autowired
    private JobOpeningService jobOpeningService;


    @GetMapping("/openings")
    public List<JobOpeningDto> getAllOpenings() {
        return jobOpeningService.getAllOpenings();
    }

    @PostMapping("/create")
    public ResponseEntity<JobOpeningDto> createJob(@RequestBody JobOpeningDto jobOpening) {
        return ResponseEntity.ok(jobOpeningService.createOpening(jobOpening));
    }

    @PutMapping("/close/{id}")
    public ResponseEntity<String> closeOpening(@PathVariable Long id) {
        jobOpeningService.closeOpening(id);
        return ResponseEntity.ok("Job closed");
    }

    @PatchMapping("/decision/{id}")
    public ResponseEntity<String> decideOpening(@PathVariable Long id, @RequestParam boolean approve) {
        jobOpeningService.decideOpening(id, approve);
        return ResponseEntity.ok(approve ? "Job approved" : "Job rejected");
    }
}
