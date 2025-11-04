package com.pgis.hrms.core.employee.repository;

import com.pgis.hrms.core.employee.entity.Compensation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompensationRepository extends JpaRepository<Compensation, Integer> {
    
    List<Compensation> findByEmployeeEmployeeId(Integer employeeId);
    
    Optional<Compensation> findByEmployeeEmployeeIdAndCompensationId(Integer employeeId, Integer compensationId);
    
    void deleteByEmployeeEmployeeId(Integer employeeId);
}
