package com.pgis.hrms.modules.Employee.repository;



import com.pgis.hrms.modules.Employee.entity.EmployeeTest;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepositoryTest extends JpaRepository<EmployeeTest, Long> {
    // for custom query
}
