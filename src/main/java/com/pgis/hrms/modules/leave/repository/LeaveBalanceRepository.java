package com.pgis.hrms.modules.leave.repository;

import com.pgis.hrms.modules.leave.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;

public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance,Integer> {
    Optional<LeaveBalance> findByEmployeeEmployeeIdAndLeaveTypeAndYear(Integer empId, LeaveType type, int year);
    List<LeaveBalance> findByEmployeeEmployeeIdAndYear(Integer empId, int year);
}