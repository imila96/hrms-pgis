package com.pgis.hrms.core.employee.repository;

import com.pgis.hrms.core.employee.entity.Employment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmploymentRepository extends JpaRepository<Employment, Integer> {
    
    List<Employment> findByEmployeeEmployeeId(Integer employeeId);

    Optional<Employment> findFirstByEmployeeEmployeeIdOrderByDateOfJoiningAsc(Integer employeeId);

    Optional<Employment> findByEmployeeEmployeeIdAndEmploymentId(Integer employeeId, Integer employmentId);
    
    void deleteByEmployeeEmployeeId(Integer employeeId);
}
