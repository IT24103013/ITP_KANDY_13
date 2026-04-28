package com.samarasinghemotors.vehiclesystem.modules.booking.controller;

import com.samarasinghemotors.vehiclesystem.modules.booking.dto.BookingRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.booking.service.BookingService;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @GetMapping("/check-availability")
    public ResponseEntity<Boolean> checkAvailability(
            @RequestParam Integer vehicleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        boolean available = bookingService.isAvailable(vehicleId, startDate, endDate);
        return ResponseEntity.ok(available);
    }


    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO request) {
        try {
            Booking newBooking = bookingService.createBooking(request);
            return new ResponseEntity<>(newBooking, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @Transactional
    @DeleteMapping("/{bookingId}/cancel")
    public ResponseEntity<String> cancelBooking(@PathVariable Integer bookingId) {

        return bookingRepository.findById(bookingId).map(booking -> {
            // Reset vehicle status to Available
            VehicleRent vehicle = booking.getVehicleRent();
            if (vehicle != null) {
                vehicle.setStatus("Available");
                vehicleRentRepository.save(vehicle);
            }

            bookingRepository.delete(booking);
            return ResponseEntity.ok("Booking Cancelled Successfully!");
        }).orElse(ResponseEntity.status(404).body("Booking not found."));
    }

    @GetMapping("/customer/{customerId}/history")
    public ResponseEntity<?> getCustomerHistory(@PathVariable Integer customerId) {
        return ResponseEntity.ok(bookingRepository.findByCustomer_UserIdAndBookingStatusOrderByCreatedAtDesc(customerId, "Confirmed"));
    }
}