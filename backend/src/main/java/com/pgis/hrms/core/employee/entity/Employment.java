package com.pgis.hrms.core.employee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "employment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer employmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "employeeId", nullable = false)
    private Employee employee;

    @Column(length = 100)
    private String jobTitle;

    @Column(length = 100)
    private String department;

    private LocalDate dateOfJoining;

    private LocalDate probationEndDate;

    private LocalDate confirmationDate;

    private LocalDate dateOfRetirement;

    @Column(length = 50)
    private String employmentStatus;
}
