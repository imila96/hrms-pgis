package com.pgis.hrms.core.employee.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "contact")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer contactId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "employeeId" ,nullable = false)
    private Employee employee;

    @Column(columnDefinition = "TEXT")
    private String permanentAddress;

    @Column(columnDefinition = "TEXT")
    private String currentAddress;

    @Column(length = 20)
    private String mobileNumber;

    @Column(length = 20)
    private String homeTelephone;

    @Column(length = 100)
    private String workEmail;

    @Column(length = 100)
    private String personalEmail;

    @Column(length = 100)
    private String emergencyName;

    @Column(length = 50)
    private String emergencyRelationship;

    @Column(length = 20)
    private String emergencyPhone;
}
