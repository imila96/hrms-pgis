package com.pgis.hrms.modules.salary.service;

import com.pgis.hrms.core.auth.repository.UserRepository;
import com.pgis.hrms.modules.salary.dto.SalarySlipDto;
import com.pgis.hrms.modules.salary.repository.SalarySlipRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryService {

    private final SalarySlipRepository repo;
    private final UserRepository userRepo;

    public SalarySlipDto getMySlip(String email, int y, int m) {
        var emp = userRepo.findByEmail(email)
                .orElseThrow()
                .getEmployee();
        var slip = repo.findByEmployeeEmployeeIdAndPeriodYearAndPeriodMonth(
                        emp.getEmployeeId(), y, m)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Payslip "+m+"/"+y+" not found"));
        return SalarySlipDto.from(slip);
    }

    public List<SalarySlipDto> listMySlips(String email) {
        var empId = userRepo.findByEmail(email).orElseThrow()
                .getEmployee().getEmployeeId();
        return repo.findByEmployeeEmployeeIdOrderByPeriodYearDescPeriodMonthDesc(empId)
                .stream().map(SalarySlipDto::from).toList();
    }

    // ADMIN getters if needed later...
}
