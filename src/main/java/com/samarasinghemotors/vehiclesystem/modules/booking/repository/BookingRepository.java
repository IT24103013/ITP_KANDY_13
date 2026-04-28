package com.samarasinghemotors.vehiclesystem.modules.booking.repository;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicleRent.vehicleRentId = :vehicleId " +
           "AND b.bookingStatus IN ('Confirmed', 'Pending Payment') " +
           "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    boolean existsOverlappingBooking(@Param("vehicleId") Integer vehicleId,
                                     @Param("startDate") LocalDate startDate,
                                     @Param("endDate") LocalDate endDate);

    boolean existsByCustomer_UserIdAndPromotion_PromoId(Integer customerId, Integer promoId);

    List<Booking> findByCustomer_UserIdAndBookingStatusOrderByCreatedAtDesc(Integer userId, String status);

    @Query("SELECT b FROM Booking b " +
           "LEFT JOIN FETCH b.vehicleRent " +
           "WHERE b.customer.userId = :customerId " +
           "AND b.createdAt >= :from " +
           "AND b.createdAt <= :to " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findByCustomerInDateRange(@Param("customerId") Integer customerId,
                                            @Param("from") LocalDateTime from,
                                            @Param("to") LocalDateTime to);
}

