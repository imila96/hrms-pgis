package com.pgis.hrms.modules.issue.dto;

import com.pgis.hrms.modules.issue.entity.IssueReport.Status;
import com.pgis.hrms.modules.issue.entity.IssueReport.IssueType;
import java.time.LocalDateTime;

public record IssueRes(
        Long id,
        String title,
        String description,
        IssueType type,
        Status status,
        String submittedBy,
        String remark,
        String updatedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
