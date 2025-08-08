package com.pgis.hrms.core.auth.repository;

import com.pgis.hrms.core.auth.dto.PendingUserDto;
import com.pgis.hrms.core.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Integer> {

    Optional<User> findByEmail(String email);
    @Query("""
      select new com.pgis.hrms.core.auth.dto.PendingUserDto(u.userId, u.email, e.name, e.jobTitle)
      from User u join u.employee e
      where u.adminPasswordAssigned = false
    """)
    List<PendingUserDto> findPendingUsersWithEmployee();
}
