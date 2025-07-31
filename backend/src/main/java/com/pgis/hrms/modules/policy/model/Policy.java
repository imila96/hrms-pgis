package com.pgis.hrms.modules.policy.model;

import com.pgis.hrms.core.auth.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "policy")
public class Policy {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer policyId;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String description;

    @Column(name = "effective_date", nullable = false)
    private LocalDate effectiveDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status = PolicyStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decided_by")
    private User decidedBy;          // director who approved / rejected

    private LocalDateTime decidedAt;

    private LocalDateTime createdAt = LocalDateTime.now();
}