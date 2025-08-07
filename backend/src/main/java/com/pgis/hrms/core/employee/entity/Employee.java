package com.pgis.hrms.core.employee.entity;

import com.pgis.hrms.core.auth.entity.User;
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
    private Integer employeeId;

    private String  name;
    private String  contact;
    private String  address;
    private String  jobTitle;
    private LocalDate hireDate;
    private String email;

    /* link back to auth account */
    @OneToOne @MapsId
    @JoinColumn(name = "employee_id")
    private User user;
}
