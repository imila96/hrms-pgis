package com.pgis.hrms.modules.attendance.repository;

import com.pgis.hrms.modules.attendance.model.AttendanceEvent;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.*;
import java.util.*;

public interface AttendanceEventRepository
        extends JpaRepository<AttendanceEvent, Integer> {

    /**
     * Native summary for a single employee over a date range (inclusive).
     * see docs in AttendanceDesign.md for SQL rationale.
     */
    @Query(value = """
            SELECT  e.employee_id                                       AS empId,
                    e.evt_date                                          AS workDate,
                    MIN(CASE WHEN e.event_type='CHECK_IN'  THEN e.evt_ts END) AS firstIn,
                    MAX(CASE WHEN e.event_type='CHECK_OUT' THEN e.evt_ts END) AS lastOut,
                    -- sum of all breaks (minutes)
                    COALESCE(SUM(
                        CASE WHEN e.event_type='BREAK_OUT' THEN
                            TIMESTAMPDIFF(MINUTE, e.evt_ts,
                                (SELECT be.evt_ts FROM attendance_event be
                                  WHERE be.employee_id=e.employee_id
                                    AND be.evt_date    =e.evt_date
                                    AND be.event_type  ='BREAK_IN'
                                    AND be.evt_ts      > e.evt_ts
                                  ORDER BY be.evt_ts
                                  LIMIT 1))
                        END),0)                                          AS breakMin,
                    -- paid minutes = whole span – breaks
                    (TIMESTAMPDIFF(MINUTE,
                        MIN(CASE WHEN e.event_type='CHECK_IN'  THEN e.evt_ts END),
                        MAX(CASE WHEN e.event_type='CHECK_OUT' THEN e.evt_ts END))
                      - COALESCE(SUM(
                        CASE WHEN e.event_type='BREAK_OUT' THEN
                            TIMESTAMPDIFF(MINUTE, e.evt_ts,
                                (SELECT be.evt_ts FROM attendance_event be
                                  WHERE be.employee_id=e.employee_id
                                    AND be.evt_date    =e.evt_date
                                    AND be.event_type  ='BREAK_IN'
                                    AND be.evt_ts      > e.evt_ts
                                  ORDER BY be.evt_ts
                                  LIMIT 1)) END),0))                     AS paidMin
            FROM attendance_event e
            WHERE e.employee_id = :empId
              AND e.evt_date   BETWEEN :from AND :to
            GROUP BY e.employee_id, e.evt_date
            ORDER BY e.evt_date""", nativeQuery = true)
    List<Object[]> findDailySummary(@Param("empId") Integer empId,
                                    @Param("from") LocalDate from,
                                    @Param("to")   LocalDate to);
}