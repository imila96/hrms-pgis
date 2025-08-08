package com.pgis.hrms.modules.recruitment.controller;


import com.pgis.hrms.modules.recruitment.model.JobOpening;
import com.pgis.hrms.modules.recruitment.service.JobOpeningService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.w3c.dom.stylesheets.LinkStyle;

import java.util.List;

@RestController
@RequestMapping("/hr/recruitment")
public class RecruitmentController {

    @Autowired
    private JobOpeningService jobOpeningService;


    @GetMapping("/openings")
    public List<JobOpening> getAllOpenings() {
        return jobOpeningService.getAllOpenings();
    }

    @PostMapping("/create")
    public ResponseEntity<JobOpening> createJob(@RequestBody JobOpening jobOpening) {
        return ResponseEntity.ok(jobOpeningService.createOpening(jobOpening));
    }

    @PutMapping("/close/{id}")
    public ResponseEntity<String> closeOpening(@PathVariable Long id) {
        jobOpeningService.closeOpening(id);
        return ResponseEntity.ok("Job closed");
    }
}
