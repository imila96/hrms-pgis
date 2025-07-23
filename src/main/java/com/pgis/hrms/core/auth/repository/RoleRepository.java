package com.pgis.hrms.core.auth.repository;

import com.pgis.hrms.core.auth.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role,Integer> {
    Optional<Role> findByCode(String code);

}
