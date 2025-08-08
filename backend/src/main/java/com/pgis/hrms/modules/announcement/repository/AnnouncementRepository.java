package com.pgis.hrms.modules.announcement.repository;

import com.pgis.hrms.modules.announcement.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface AnnouncementRepository extends JpaRepository<Announcement,Integer> {
    List<Announcement> findByStatusOrderByPublishedDateDesc(AnnouncementStatus status);

    @Query("""
       SELECT a FROM Announcement a
        WHERE (:status IS NULL OR a.status = :status)
       ORDER BY a.createdDate DESC
       """)
    List<Announcement> search(@Param("status") AnnouncementStatus status);
}