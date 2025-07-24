package com.pgis.hrms.modules.salary.dto;

import com.pgis.hrms.modules.salary.entity.SalarySlip;

import java.math.BigDecimal;

public record SalarySlipDto(
        int year,
        int month,
        BigDecimal basicPay,
        BigDecimal allowances,
        BigDecimal deductions,
        BigDecimal netPay,
        String pdfUrl) {

    public static SalarySlipDto from(SalarySlip s) {
        return new SalarySlipDto(
                s.getPeriodYear(),
                s.getPeriodMonth(),
                s.getBasicPay(),
                s.getAllowances(),
                s.getDeductions(),
                s.getNetPay(),
                s.getPdfUrl());
    }
}
