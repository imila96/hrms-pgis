package com.pgis.hrms.modules.issue.repository;

import com.pgis.hrms.modules.issue.entity.IssueReport;
import com.pgis.hrms.modules.issue.entity.IssueReport.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface IssueReportRepository extends JpaRepository<IssueReport, Long> {
    List<IssueReport> findBySubmittedBy(String submittedBy);
    List<IssueReport> findBySubmittedByAndStatus(String submittedBy, Status status);
    List<IssueReport> findByStatus(Status status);
}
