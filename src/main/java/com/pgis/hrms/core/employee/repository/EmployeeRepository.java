package com.pgis.hrms.core.employee.repository;

import com.pgis.hrms.core.employee.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee,Integer> { }

