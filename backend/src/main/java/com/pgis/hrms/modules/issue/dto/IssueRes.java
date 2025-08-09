package com.pgis.hrms.modules.issue.dto;

import com.pgis.hrms.modules.issue.entity.IssueReport.Status;
import java.time.LocalDateTime;

public record IssueRes(
        Long id,
        String title,
        String description,
        Status status,
        String submittedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
