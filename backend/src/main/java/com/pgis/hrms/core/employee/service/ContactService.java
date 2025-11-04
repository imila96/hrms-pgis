package com.pgis.hrms.core.employee.service;

import com.pgis.hrms.core.employee.dto.ContactDto;

import java.util.List;

public interface ContactService {
    
    ContactDto createContact(Integer employeeId, ContactDto dto);
    
    List<ContactDto> getAllContactsByEmployee(Integer employeeId);
    
    ContactDto getContactById(Integer employeeId, Integer contactId);
    
    ContactDto updateContact(Integer employeeId, Integer contactId, ContactDto dto);
    
    void deleteContact(Integer employeeId, Integer contactId);
}
