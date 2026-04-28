package com.samarasinghemotors.vehiclesystem.modules.booking.service;

import com.samarasinghemotors.vehiclesystem.modules.booking.dto.BookingRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Customer;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.CustomerRepository;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import com.samarasinghemotors.vehiclesystem.modules.promotion.entity.Promotion;
import com.samarasinghemotors.vehiclesystem.modules.promotion.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Service
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    @Autowired
    private PromotionService promotionService;

    public boolean isAvailable(Integer vehicleId, java.time.LocalDate start, java.time.LocalDate end) {
        return !bookingRepository.existsOverlappingBooking(vehicleId, start, end);
    }

    @Transactional
    public Booking createBooking(BookingRequestDTO request) {
        if (request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("Start date cannot be in the past!");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be at or after Start date!");
        }

        VehicleRent vehicle = vehicleRentRepository.findByIdWithLock(request.getVehicleRentId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found!"));

        if (!isAvailable(request.getVehicleRentId(), request.getStartDate(), request.getEndDate())) {
            throw new RuntimeException("Vehicle is not available for the selected dates!");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found!"));

        long daysBetween = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (daysBetween <= 0) {
            throw new RuntimeException("Invalid date range selected!");
        }

        BigDecimal totalCost = vehicle.getDailyRate().multiply(BigDecimal.valueOf(daysBetween));
        
        Booking newBooking = new Booking();
        newBooking.setCustomer(customer);
        newBooking.setVehicleRent(vehicle);
        newBooking.setStartDate(request.getStartDate());
        newBooking.setEndDate(request.getEndDate());
        newBooking.setBookingStatus("Pending Payment");

        // Apply Promotion if provided, with customerId for one-time check
        if (request.getPromoCode() != null && !request.getPromoCode().isBlank()) {
            try {
                Promotion promo = promotionService.validatePromoCode(request.getPromoCode(), request.getCustomerId());
                totalCost = promotionService.calculateFinalPrice(totalCost, request.getPromoCode(), request.getCustomerId());
                newBooking.setPromotion(promo);
            } catch (IllegalArgumentException e) {
                throw new RuntimeException("Promo Code Error: " + e.getMessage());
            }
        }

        newBooking.setTotalCost(totalCost);

        vehicle.setStatus("Pending");
        vehicleRentRepository.save(vehicle);

        return bookingRepository.save(newBooking);
    }
}