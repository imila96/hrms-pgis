package com.pgis.hrms.modules.salary.controller;

import com.pgis.hrms.modules.salary.dto.SalarySlipDto;
import com.pgis.hrms.modules.salary.service.SalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/salary")
@RequiredArgsConstructor
public class SalaryController {

    private final SalaryService svc;

    // GET /salary/slip?year=2025&month=7
    @GetMapping("/slip")
    public SalarySlipDto mySlip(@RequestParam int year,
                                @RequestParam int month,
                                @AuthenticationPrincipal UserDetails ud) {
        return svc.getMySlip(ud.getUsername(), year, month);
    }

    // GET /salary/slips  (list all for self)
    @GetMapping("/slips")
    public List<SalarySlipDto> mySlips(@AuthenticationPrincipal UserDetails ud) {
        return svc.listMySlips(ud.getUsername());
    }
}
