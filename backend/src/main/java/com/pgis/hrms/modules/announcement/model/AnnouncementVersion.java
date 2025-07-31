package com.pgis.hrms.modules.announcement.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.*;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "announcement_version")
public class AnnouncementVersion {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer versionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @Column(nullable = false, length = 200)
    private String title;

    @Lob @Column(nullable = false)
    private String description;

    @Column(name = "edited_by", nullable = false)
    private Integer editedBy;   // UserId

    @Column(name = "edited_date", nullable = false)
    private LocalDateTime editedDate = LocalDateTime.now();
}