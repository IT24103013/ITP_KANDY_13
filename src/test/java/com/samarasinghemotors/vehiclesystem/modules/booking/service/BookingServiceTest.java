package com.samarasinghemotors.vehiclesystem.modules.booking.service;

import com.samarasinghemotors.vehiclesystem.modules.booking.dto.BookingRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Customer;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.CustomerRepository;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private VehicleRentRepository vehicleRentRepository;

    @InjectMocks
    private BookingService bookingService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateBooking_TotalCostCalculation() {
        // Arrange
        BookingRequestDTO request = new BookingRequestDTO();
        request.setCustomerId(1);
        request.setVehicleRentId(10);
        request.setStartDate(LocalDate.now().plusDays(1));
        request.setEndDate(LocalDate.now().plusDays(5)); // Exactly 5 days (1 to 5 inclusive)
        
        VehicleRent vehicle = new VehicleRent();
        vehicle.setVehicleRentId(10);
        vehicle.setDailyRate(new BigDecimal("2500"));
        vehicle.setStatus("Available");

        Customer customer = new Customer();
        customer.setUserId(1);

        when(vehicleRentRepository.findByIdWithLock(10)).thenReturn(Optional.of(vehicle));
        when(customerRepository.findById(1)).thenReturn(Optional.of(customer));
        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Booking result = bookingService.createBooking(request);

        // Assert
        assertNotNull(result);
        assertEquals(new BigDecimal("12500"), result.getTotalCost()); // 2500 * 5 = 12500
        assertEquals("Pending", vehicle.getStatus());
        verify(bookingRepository, times(1)).save(any(Booking.class));
    }

    @Test
    void testCreateBooking_PastDate_ShouldThrowException() {
        // Arrange
        BookingRequestDTO request = new BookingRequestDTO();
        request.setStartDate(LocalDate.now().minusDays(1));
        request.setEndDate(LocalDate.now().plusDays(2));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });
        assertEquals("Start date cannot be in the past!", exception.getMessage());
    }

    @Test
    void testCreateBooking_InvalidDateRange_ShouldThrowException() {
        // Arrange
        BookingRequestDTO request = new BookingRequestDTO();
        request.setStartDate(LocalDate.now().plusDays(5));
        request.setEndDate(LocalDate.now().plusDays(2));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(request);
        });
        assertEquals("End date must be at or after Start date!", exception.getMessage());
    }
}
