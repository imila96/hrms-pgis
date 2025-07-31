package com.pgis.hrms.modules.announcement.dto;

import com.pgis.hrms.modules.announcement.model.AnnouncementStatus;
import java.time.*;

public record AnnouncementDto(Integer id,
                              String title,
                              AnnouncementStatus status,
                              LocalDateTime publishedAt) {}