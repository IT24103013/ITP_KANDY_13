package com.samarasinghemotors.vehiclesystem.modules.payment.service;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.entity.Payment;
import com.samarasinghemotors.vehiclesystem.modules.payment.repository.PaymentRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Customer;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PdfGenerationService pdfGenerationService;

    @Mock
    private EmailService emailService;

    @Mock
    private VehicleRentRepository vehicleRentRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private PaymentService paymentService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testReviewPayment_Approve_Success() {
        // Arrange
        Integer paymentId = 1;
        String status = "Approved";
        
        Customer customer = new Customer();
        customer.setFullName("John Doe");
        customer.setEmail("john@example.com");

        VehicleRent vehicle = new VehicleRent();
        vehicle.setStatus("Pending");

        Booking booking = new Booking();
        booking.setBookingId(100);
        booking.setCustomer(customer);
        booking.setVehicleRent(vehicle);

        Payment payment = new Payment();
        payment.setPaymentId(paymentId);
        payment.setBooking(booking);

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));
        when(pdfGenerationService.generateInvoicePdf(any(), any())).thenReturn(new byte[]{1, 2, 3});

        // Act
        paymentService.reviewPayment(paymentId, status, null, null);

        // Assert
        assertEquals("Approved", payment.getStatus());
        assertEquals("Confirmed", booking.getBookingStatus());
        assertEquals("Reserved", vehicle.getStatus());
        
        verify(pdfGenerationService, times(1)).generateInvoicePdf(booking, payment);
        verify(emailService, times(1)).sendApprovalEmail(eq("john@example.com"), eq("John Doe"), eq(booking), any());
        verify(vehicleRentRepository, times(1)).save(vehicle);
        verify(bookingRepository, times(1)).save(booking);
        verify(paymentRepository, times(1)).save(payment);
    }

    @Test
    void testReviewPayment_Reject_Success() {
        // Arrange
        Integer paymentId = 1;
        String status = "Rejected";
        String remarks = "Insufficient funds";
        
        Customer customer = new Customer();
        customer.setFullName("John Doe");
        customer.setEmail("john@example.com");

        VehicleRent vehicle = new VehicleRent();
        vehicle.setStatus("Pending");

        Booking booking = new Booking();
        booking.setBookingId(100);
        booking.setCustomer(customer);
        booking.setVehicleRent(vehicle);

        Payment payment = new Payment();
        payment.setPaymentId(paymentId);
        payment.setBooking(booking);

        when(paymentRepository.findById(paymentId)).thenReturn(Optional.of(payment));

        // Act
        paymentService.reviewPayment(paymentId, status, remarks, null);

        // Assert
        assertEquals("Rejected", payment.getStatus());
        assertEquals("Insufficient funds", payment.getRemarks());
        assertEquals("Pending Payment", booking.getBookingStatus());
        assertEquals("Available", vehicle.getStatus());

        verify(emailService, times(1)).sendRejectionEmail(eq("john@example.com"), eq("John Doe"), eq("100"), eq(remarks));
        verify(vehicleRentRepository, times(1)).save(vehicle);
        verify(bookingRepository, times(1)).save(booking);
        verify(paymentRepository, times(1)).save(payment);
    }
}
