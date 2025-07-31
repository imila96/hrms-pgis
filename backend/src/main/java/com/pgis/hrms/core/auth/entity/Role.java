package com.pgis.hrms.core.auth.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "role")
public class Role {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer roleId;

    private String code;
}
