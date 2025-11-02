package com.pgis.hrms.core.employee.repository;

import com.pgis.hrms.core.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee,Integer> {

    Optional<Employee> findByEmail(String email);

    @Query("""
        SELECT e FROM Employee e 
        WHERE NOT EXISTS (
            SELECT 1 FROM User u WHERE u.employee.employeeId = e.employeeId
        )
    """)
    List<Employee> findEmployeesWithoutUsers();

}

