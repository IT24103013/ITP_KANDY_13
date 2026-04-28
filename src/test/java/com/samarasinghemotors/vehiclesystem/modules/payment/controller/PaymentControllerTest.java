package com.samarasinghemotors.vehiclesystem.modules.payment.controller;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.repository.PaymentRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.service.PaymentService;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PaymentControllerTest {

    private MockMvc mockMvc;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private VehicleRentRepository vehicleRentRepository;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private PaymentController paymentController;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(paymentController).build();
    }

    @Test
    void testUploadPayment_InvalidFileType_ShouldReturn400() throws Exception {
        // Arrange: Mock file with text/plain type
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.txt", "text/plain", "dummy content".getBytes());

        // Act & Assert
        mockMvc.perform(multipart("/api/payments/upload")
                        .file(file)
                        .param("bookingId", "1")
                        .param("amount", "5000.00")
                        .param("paymentDate", LocalDate.now().toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Only JPG, PNG, and PDF files are allowed."));
    }

    @Test
    void testUploadPayment_PastDate_ShouldReturn400() throws Exception {
        // Arrange: Valid file but past date
        MockMultipartFile file = new MockMultipartFile(
                "file", "slip.jpg", "image/jpeg", "dummy image".getBytes());

        LocalDate pastDate = LocalDate.now().minusDays(1);

        // Act & Assert
        mockMvc.perform(multipart("/api/payments/upload")
                        .file(file)
                        .param("bookingId", "1")
                        .param("amount", "5000.00")
                        .param("paymentDate", pastDate.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Error: Payment date cannot be in the past."));
    }

    @Test
    void testUploadPayment_ValidInput_ShouldReturn200() throws Exception {
        // Arrange: Valid file and valid date
        MockMultipartFile file = new MockMultipartFile(
                "file", "slip.jpg", "image/jpeg", "dummy image".getBytes());

        Booking booking = new Booking();
        booking.setBookingId(1);

        when(bookingRepository.findById(1)).thenReturn(Optional.of(booking));

        // Act & Assert
        mockMvc.perform(multipart("/api/payments/upload")
                        .file(file)
                        .param("bookingId", "1")
                        .param("amount", "5000.00")
                        .param("paymentDate", LocalDate.now().toString()))
                .andExpect(status().isOk())
                .andExpect(content().string("Payment Uploaded Successfully. Waiting for Admin Approval"));
    }
}
