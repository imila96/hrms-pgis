package com.pgis.hrms.modules.salary.entity;

import com.pgis.hrms.core.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "salary_slip")
@Getter @Setter @NoArgsConstructor
public class SalarySlip {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer slipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    private int  periodYear;
    private int  periodMonth;
    private BigDecimal basicPay;
    private BigDecimal allowances;
    private BigDecimal deductions;
    private BigDecimal netPay;
    private String pdfUrl;
    private LocalDateTime createdAt;
}
