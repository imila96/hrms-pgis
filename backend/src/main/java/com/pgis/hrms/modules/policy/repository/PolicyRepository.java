package com.pgis.hrms.modules.policy.repository;

import com.pgis.hrms.modules.policy.model.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.*;
import java.util.*;

public interface PolicyRepository extends JpaRepository<Policy,Integer> {

    @Query("""
           SELECT p FROM Policy p
            WHERE (:status IS NULL OR p.status = :status)
              AND (:effective IS NULL OR (p.status = 'APPROVED' AND p.effectiveDate <= :today))
           ORDER BY p.effectiveDate DESC
           """)
    List<Policy> search(@Param("status") PolicyStatus status,
                        @Param("effective") Boolean effective,
                        @Param("today") LocalDate today);
}