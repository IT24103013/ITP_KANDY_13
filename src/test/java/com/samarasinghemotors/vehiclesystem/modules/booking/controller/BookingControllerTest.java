package com.samarasinghemotors.vehiclesystem.modules.booking.controller;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.booking.service.BookingService;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BookingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BookingService bookingService;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRentRepository vehicleRentRepository;

    @InjectMocks
    private BookingController bookingController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController).build();
    }

    @Test
    void testCancelBooking_Success() throws Exception {
        // Arrange
        Integer bookingId = 1;
        VehicleRent vehicle = new VehicleRent();
        vehicle.setStatus("Pending");

        Booking booking = new Booking();
        booking.setBookingId(bookingId);
        booking.setVehicleRent(vehicle);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        // Act & Assert
        mockMvc.perform(delete("/api/bookings/{bookingId}/cancel", bookingId))
                .andExpect(status().isOk())
                .andExpect(content().string("Booking Cancelled Successfully!"));

        // Verify vehicle status reset
        assert(vehicle.getStatus().equals("Available"));
        verify(vehicleRentRepository, times(1)).save(vehicle);
        verify(bookingRepository, times(1)).delete(booking);
    }

    @Test
    void testCancelBooking_NotFound_ShouldReturn404() throws Exception {
        // Arrange
        Integer bookingId = 999;
        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(delete("/api/bookings/{bookingId}/cancel", bookingId))
                .andExpect(status().isNotFound())
                .andExpect(content().string("Booking not found."));
    }
}
