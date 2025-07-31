package com.pgis.hrms.modules.announcement.dto;

import com.pgis.hrms.modules.announcement.model.AnnouncementStatus;
import java.time.*;

public record AnnouncementDetailDto(Integer id,
                                    String title,
                                    String description,
                                    AnnouncementStatus status,
                                    LocalDateTime createdAt,
                                    String createdBy,
                                    LocalDateTime publishedAt,
                                    String publishedBy) {}