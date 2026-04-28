package com.samarasinghemotors.vehiclesystem.modules.booking.repository;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Integer> {

    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicleRent.vehicleRentId = :vehicleId " +
           "AND b.bookingStatus IN ('Confirmed', 'Pending Payment') " +
           "AND (:startDate <= b.endDate AND :endDate >= b.startDate)")
    boolean existsOverlappingBooking(@Param("vehicleId") Integer vehicleId, 
                                     @Param("startDate") LocalDate startDate, 
                                     @Param("endDate") LocalDate endDate);

    boolean existsByCustomer_UserIdAndPromotion_PromoId(Integer customerId, Integer promoId);

    java.util.List<Booking> findByCustomer_UserIdAndBookingStatusOrderByCreatedAtDesc(Integer userId, String status);
}
