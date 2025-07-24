package com.pgis.hrms.modules.salary.repository;

import com.pgis.hrms.modules.salary.entity.SalarySlip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SalarySlipRepository
        extends JpaRepository<SalarySlip, Integer> {

    Optional<SalarySlip> findByEmployeeEmployeeIdAndPeriodYearAndPeriodMonth(
            Integer empId, int year, int month);

    List<SalarySlip> findByEmployeeEmployeeIdOrderByPeriodYearDescPeriodMonthDesc(
            Integer empId);

    // ADMIN helper
    List<SalarySlip> findByPeriodYearAndPeriodMonth(int y, int m);
}
