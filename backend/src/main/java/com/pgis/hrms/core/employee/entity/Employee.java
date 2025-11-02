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

    private String  name;
    private String  contact;
    private String  address;
    private String  jobTitle;
    private LocalDate hireDate;
    private String email;
    @Column(nullable = true)
    private String department;
}
