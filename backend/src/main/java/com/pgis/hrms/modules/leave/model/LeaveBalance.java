package com.pgis.hrms.modules.leave.model;

import com.pgis.hrms.core.employee.entity.Employee;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "leave_balance",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id","leave_type","year"}))
public class LeaveBalance {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer balanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name="leave_type", nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private int year;            // calendar year

    @Column(nullable = false)
    private int entitled;        // total possible days

    @Column(nullable = false)
    private int taken;           // approved + not cancelled

    public int remaining() { return entitled - taken; }
}