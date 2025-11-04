package com.pgis.hrms.core.employee.service;

import com.pgis.hrms.core.employee.dto.ContactDto;
import com.pgis.hrms.core.employee.entity.Contact;
import com.pgis.hrms.core.employee.entity.Employee;
import com.pgis.hrms.core.employee.mapper.ContactMapper;
import com.pgis.hrms.core.employee.repository.ContactRepository;
import com.pgis.hrms.core.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final EmployeeRepository employeeRepository;
    private final ContactMapper contactMapper;

    @Override
    @Transactional
    public ContactDto createContact(Integer employeeId, ContactDto dto) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));
        
        Contact contact = contactMapper.toEntity(dto, employee);
        Contact saved = contactRepository.save(contact);
        return contactMapper.toDto(saved);
    }

    @Override
    public List<ContactDto> getAllContactsByEmployee(Integer employeeId) {
        return contactRepository.findByEmployeeEmployeeId(employeeId)
                .stream()
                .map(contactMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ContactDto getContactById(Integer employeeId, Integer contactId) {
        Contact contact = contactRepository
                .findByEmployeeEmployeeIdAndContactId(employeeId, contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        return contactMapper.toDto(contact);
    }

    @Override
    @Transactional
    public ContactDto updateContact(Integer employeeId, Integer contactId, ContactDto dto) {
        Contact existing = contactRepository
                .findByEmployeeEmployeeIdAndContactId(employeeId, contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));

        existing.setPermanentAddress(dto.getPermanentAddress());
        existing.setCurrentAddress(dto.getCurrentAddress());
        existing.setMobileNumber(dto.getMobileNumber());
        existing.setHomeTelephone(dto.getHomeTelephone());
        existing.setWorkEmail(dto.getWorkEmail());
        existing.setPersonalEmail(dto.getPersonalEmail());
        existing.setEmergencyName(dto.getEmergencyName());
        existing.setEmergencyRelationship(dto.getEmergencyRelationship());
        existing.setEmergencyPhone(dto.getEmergencyPhone());

        Contact updated = contactRepository.save(existing);
        return contactMapper.toDto(updated);
    }

    @Override
    @Transactional
    public void deleteContact(Integer employeeId, Integer contactId) {
        Contact contact = contactRepository
                .findByEmployeeEmployeeIdAndContactId(employeeId, contactId)
                .orElseThrow(() -> new RuntimeException("Contact not found"));
        contactRepository.delete(contact);
    }
}
