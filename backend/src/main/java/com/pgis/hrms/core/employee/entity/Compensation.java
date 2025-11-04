package com.pgis.hrms.core.employee.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "compensation")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Compensation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer compensationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", referencedColumnName = "employeeId", nullable = false)
    private Employee employee;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basicSalary;

    @Column(length = 100)
    private String bankName;

    @Column(length = 100)
    private String branch;

    @Column(length = 50)
    private String accountNo;

    @Column(length = 50)
    private String tin;

    @Column(length = 100)
    private String pensionScheme;
}
