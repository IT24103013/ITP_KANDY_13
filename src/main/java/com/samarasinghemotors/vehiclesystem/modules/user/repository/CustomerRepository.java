package com.samarasinghemotors.vehiclesystem.modules.user.repository;

import com.samarasinghemotors.vehiclesystem.modules.user.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {
}