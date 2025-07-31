package com.pgis.hrms.modules.announcement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "announcement")
public class Announcement {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer announcementId;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnnouncementStatus status = AnnouncementStatus.DRAFT;

    @Column(name = "current_version", nullable = false)
    private Integer currentVersion = 1;

    @Column(name = "created_by", nullable = false)
    private Integer createdBy;   // UserId only (no heavy mapping)

    @Column(name = "created_date", nullable = false)
    private LocalDateTime createdDate = LocalDateTime.now();

    @Column(name = "published_by")
    private Integer publishedBy; // UserId (HR / Director)

    @Column(name = "published_date")
    private LocalDateTime publishedDate;
}
