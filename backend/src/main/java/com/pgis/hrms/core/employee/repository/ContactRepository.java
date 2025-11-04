package com.pgis.hrms.core.employee.repository;

import com.pgis.hrms.core.employee.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Integer> {
    
    List<Contact> findByEmployeeEmployeeId(Integer employeeId);
    
    Optional<Contact> findByEmployeeEmployeeIdAndContactId(Integer employeeId, Integer contactId);
    
    void deleteByEmployeeEmployeeId(Integer employeeId);
}
