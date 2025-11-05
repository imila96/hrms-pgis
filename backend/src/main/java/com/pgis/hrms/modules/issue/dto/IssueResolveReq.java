package com.pgis.hrms.modules.issue.dto;

import jakarta.validation.constraints.NotBlank;

public record IssueResolveReq(
        @NotBlank(message = "Remark is required")
        String remark
) {}
