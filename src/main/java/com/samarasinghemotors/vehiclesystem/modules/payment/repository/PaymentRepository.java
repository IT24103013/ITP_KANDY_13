package com.samarasinghemotors.vehiclesystem.modules.payment.repository;

import com.samarasinghemotors.vehiclesystem.modules.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Integer> {

    List<Payment> findByStatus(String status);

    List<Payment> findByBooking_BookingIdOrderByPaymentDateDesc(Integer bookingId);

    boolean existsByBooking_BookingId(Integer bookingId);

    List<Payment> findByBooking_Customer_UserIdOrderByPaymentDateDesc(Integer customerId);

    List<Payment> findAllByOrderByPaymentDateDesc();

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = 'APPROVED'")
    BigDecimal getTotalRevenue();
}