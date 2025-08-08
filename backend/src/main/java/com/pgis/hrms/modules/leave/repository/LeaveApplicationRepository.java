package com.pgis.hrms.modules.leave.repository;

import com.pgis.hrms.modules.leave.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.*;
import java.util.*;

public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication,Integer> {
    List<LeaveApplication> findByEmployeeEmployeeIdAndStartDateBetween(Integer empId, LocalDate from, LocalDate to);

    List<LeaveApplication>
    findByStatusOrderByRequestedAtDesc(LeaveStatus status);

    List<LeaveApplication> findByEmployeeEmployeeIdOrderByRequestedAtDesc(Integer employeeId);

}
