package com.pgis.hrms.core.employee.repository;

import com.pgis.hrms.core.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository extends JpaRepository<Employee,Integer> {

    Optional<Employee> findByEmail(String email);

    @Query(value = """
        SELECT e.* FROM employee e 
        WHERE e.employee_id NOT IN (
            SELECT u.employee_id FROM user_auth u WHERE u.employee_id IS NOT NULL
        )
    """, nativeQuery = true)
    List<Employee> findEmployeesWithoutUsers();

}

