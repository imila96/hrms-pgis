package com.pgis.hrms.modules.issue.service;

import com.pgis.hrms.modules.issue.dto.IssueCreateReq;
import com.pgis.hrms.modules.issue.dto.IssueRes;
import com.pgis.hrms.modules.issue.entity.IssueReport;
import com.pgis.hrms.modules.issue.repository.IssueReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static com.pgis.hrms.modules.issue.entity.IssueReport.Status;
import static com.pgis.hrms.modules.issue.entity.IssueReport.IssueType;

@Service
@RequiredArgsConstructor
public class IssueService {
    private final IssueReportRepository repo;

    @Transactional
    public IssueRes create(String user, Long userId, IssueCreateReq req) {
        var e = new IssueReport();
        e.setTitle(req.title()); e.setDescription(req.description());
        e.setType(req.type() != null ? req.type() : IssueReport.IssueType.TECHNICAL_ISSUE);
        e.setSubmittedBy(user); e.setSubmittedById(userId);
        e.setStatus(Status.PENDING);
        e = repo.save(e);
        return toRes(e);
    }

    @Transactional(readOnly = true)
    public List<IssueRes> my(String user, Status status) {
        var list = status == null ? repo.findBySubmittedBy(user) : repo.findBySubmittedByAndStatus(user, status);
        return list.stream().map(IssueService::toRes).toList();
    }

    @Transactional(readOnly = true)
    public List<IssueRes> all(Status status) {
        var list = status == null ? repo.findAll() : repo.findByStatus(status);
        return list.stream().map(IssueService::toRes).toList();
    }

    @Transactional(readOnly = true)
    public List<IssueRes> getByType(IssueType type, Status status) {
        var list = status == null ? repo.findByType(type) : repo.findByTypeAndStatus(type, status);
        return list.stream().map(IssueService::toRes).toList();
    }

    @Transactional
    public IssueRes resolve(Long id, String remark, String resolverName) {
        var e = repo.findById(id).orElseThrow();
        e.setStatus(Status.RESOLVED);
        e.setRemark(remark);
        e.setUpdatedBy(resolverName);
        return toRes(e);
    }

    private static IssueRes toRes(IssueReport e) {
        return new IssueRes(e.getId(), e.getTitle(), e.getDescription(), e.getType(), e.getStatus(),
                e.getSubmittedBy(), e.getRemark(), e.getUpdatedBy(), e.getCreatedAt(), e.getUpdatedAt());
    }
}
