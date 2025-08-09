package com.pgis.hrms.modules.issue.entity;

import jakarta.persistence.*;
import lombok.Getter; import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter @Setter
@Entity @Table(name = "issue_reports")
public class IssueReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String title;
    @Column(nullable = false, length = 2000) private String description;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private Status status = Status.PENDING;

    // keep both if you have users by email/ID; adjust as needed
    private Long submittedById;
    @Column(length = 255) private String submittedBy; // email/username

    @CreationTimestamp private LocalDateTime createdAt;
    @UpdateTimestamp private LocalDateTime updatedAt;

    public enum Status { PENDING, RESOLVED }
}
