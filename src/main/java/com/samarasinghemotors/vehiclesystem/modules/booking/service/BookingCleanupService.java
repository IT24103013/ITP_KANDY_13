package com.samarasinghemotors.vehiclesystem.modules.booking.service;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.repository.PaymentRepository;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingCleanupService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    /**
     * Cleans up pending bookings that have no associated payment after 15 minutes.
     * This runs every 1 minute.
     */
    @Scheduled(fixedRate = 60000) // Every 1 minute
    @Transactional
    public void cleanupStaleBookings() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        
        // Find bookings created more than 15 mins ago that are still in "Pending Payment" status
        // and have NO entry in the payments table.
        List<Booking> staleBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() != null && b.getBookingStatus().equals("Pending Payment"))
                .filter(b -> b.getCreatedAt() != null && b.getCreatedAt().isBefore(threshold))
                .filter(b -> !paymentRepository.existsByBooking_BookingId(b.getBookingId()))
                .collect(Collectors.toList());

        if (!staleBookings.isEmpty()) {
            System.out.println("Cleaning up " + staleBookings.size() + " stale bookings...");
            
            // Reset vehicle status to Available for each stale booking
            for (Booking booking : staleBookings) {
                VehicleRent vehicle = booking.getVehicleRent();
                if (vehicle != null) {
                    vehicle.setStatus("Available");
                    vehicleRentRepository.save(vehicle);
                }
            }

            bookingRepository.deleteAll(staleBookings);
        }
    }
}
