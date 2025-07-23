package com.pgis.hrms.core.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter @Setter @NoArgsConstructor
@Entity @Table(name = "user_auth")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer userId;

    private String email;
    private String password;
    private Boolean active   = true;
    private Boolean verified = true;

    private LocalDateTime passwordChangedAt;

    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private com.pgis.hrms.core.employee.entity.Employee employee;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_role",
            joinColumns        = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();
}
