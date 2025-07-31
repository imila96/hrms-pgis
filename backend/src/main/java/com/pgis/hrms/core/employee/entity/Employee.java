package com.pgis.hrms.core.employee.entity;

import com.pgis.hrms.core.auth.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "employee")
public class Employee {

    @Id
    private Integer employeeId;

    private String  name;
    private String  contact;
    private String  address;
    private String  jobTitle;
    private LocalDate hireDate;

    /* link back to auth account */
    @OneToOne @MapsId
    @JoinColumn(name = "employee_id")
    private User user;
}
