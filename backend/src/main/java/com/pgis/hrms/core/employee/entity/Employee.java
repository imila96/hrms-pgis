package com.pgis.hrms.core.employee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "employee")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer employeeId;

    private String name;
    private String email;
    
    // New SSE-specific fields
    private String gender;
    private LocalDate dateOfBirth;
    private String nationality;
    private String nicNo;
    private String maritalStatus;
    private String religion;
    private String bloodGroup;
    
    @Lob
    @Column(length = 255)
    private String profileImage;
}
