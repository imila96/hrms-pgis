package com.pgis.hrms.modules.announcement.repository;

import com.pgis.hrms.modules.announcement.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface AnnouncementRepository extends JpaRepository<Announcement,Integer> {
    List<Announcement> findByStatusOrderByPublishedDateDesc(AnnouncementStatus status);
}