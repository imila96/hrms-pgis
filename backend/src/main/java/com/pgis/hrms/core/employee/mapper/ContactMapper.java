package com.pgis.hrms.core.employee.mapper;

import com.pgis.hrms.core.employee.dto.ContactDto;
import com.pgis.hrms.core.employee.entity.Contact;
import com.pgis.hrms.core.employee.entity.Employee;
import org.springframework.stereotype.Component;

@Component
public class ContactMapper {

    public ContactDto toDto(Contact contact) {
        if (contact == null) return null;

        return ContactDto.builder()
                .contactId(contact.getContactId())
                .employeeId(contact.getEmployee() != null ? contact.getEmployee().getEmployeeId() : null)
                .permanentAddress(contact.getPermanentAddress())
                .currentAddress(contact.getCurrentAddress())
                .mobileNumber(contact.getMobileNumber())
                .homeTelephone(contact.getHomeTelephone())
                .workEmail(contact.getWorkEmail())
                .personalEmail(contact.getPersonalEmail())
                .emergencyName(contact.getEmergencyName())
                .emergencyRelationship(contact.getEmergencyRelationship())
                .emergencyPhone(contact.getEmergencyPhone())
                .build();
    }

    public Contact toEntity(ContactDto dto, Employee employee) {
        if (dto == null) return null;

        return Contact.builder()
                .contactId(dto.getContactId())
                .employee(employee)
                .permanentAddress(dto.getPermanentAddress())
                .currentAddress(dto.getCurrentAddress())
                .mobileNumber(dto.getMobileNumber())
                .homeTelephone(dto.getHomeTelephone())
                .workEmail(dto.getWorkEmail())
                .personalEmail(dto.getPersonalEmail())
                .emergencyName(dto.getEmergencyName())
                .emergencyRelationship(dto.getEmergencyRelationship())
                .emergencyPhone(dto.getEmergencyPhone())
                .build();
    }
}
