package com.pgis.hrms.modules.issue.dto;

import com.pgis.hrms.modules.issue.entity.IssueReport.IssueType;

public record IssueCreateReq(String title, String description, IssueType type) {}
