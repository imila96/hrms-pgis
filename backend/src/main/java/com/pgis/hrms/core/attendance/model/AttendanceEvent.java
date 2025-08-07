package com.pgis.hrms.core.attendance.model;

import com.pgis.hrms.core.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.*;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "attendance_event")
public class AttendanceEvent {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer eventId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceEventType eventType;

    @Column(name = "evt_ts", nullable = false)
    private LocalDateTime timestamp;

    // de‑normalised column used for GROUP BY (avoids DATE() casts in SQL)
    @Column(name = "evt_date", nullable = false)
    private LocalDate eventDate;

    @PrePersist
    void onPersist() {
        if (eventDate == null && timestamp != null) {
            eventDate = timestamp.toLocalDate();
        }
    }
}