package com.samarasinghemotors.vehiclesystem.modules.payment.service;

import com.samarasinghemotors.vehiclesystem.modules.payment.entity.Payment;
import com.samarasinghemotors.vehiclesystem.modules.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private PdfGenerationService pdfGenerationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    @Autowired
    private BookingRepository bookingRepository;


    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    public Payment createPayment(Payment payment) {
        return paymentRepository.save(payment);
    }

    public Optional<Payment> getPaymentById(Integer id) {
        return paymentRepository.findById(id);
    }

    public Payment updatePaymentStatus(Integer id, String status) {
        return paymentRepository.findById(id).map(payment -> {
            payment.setStatus(status);
            return paymentRepository.save(payment);
        }).orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public Payment reviewPayment(Integer paymentId, String status, String remarks, LocalDate paymentDate) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (paymentDate != null) {
            payment.setPaymentDate(paymentDate);
        }
        
        Booking booking = payment.getBooking();
        String customerEmail = booking.getCustomer().getEmail();
        String customerName = booking.getCustomer().getFullName();

        if ("Approved".equalsIgnoreCase(status) || "APPROVE".equalsIgnoreCase(status)) {
            payment.setStatus("Approved");
            booking.setBookingStatus("Confirmed");

            // Update Vehicle Status
            VehicleRent vehicle = booking.getVehicleRent();
            if (vehicle != null) {
                vehicle.setStatus("Reserved");
                vehicleRentRepository.save(vehicle);
            }
            
            // Generate PDF
            byte[] pdfBytes = pdfGenerationService.generateInvoicePdf(booking, payment);

            // Send Async Approval Email
            emailService.sendApprovalEmail(customerEmail, customerName, booking, pdfBytes);
            //reject
        } else if ("Rejected".equalsIgnoreCase(status) || "REJECT".equalsIgnoreCase(status)) {
            payment.setStatus("Rejected");
            payment.setRemarks(remarks);
            booking.setBookingStatus("Pending Payment");

            // Send Async Rejection Email
            emailService.sendRejectionEmail(customerEmail, customerName, String.valueOf(booking.getBookingId()), remarks);

            // Reset Vehicle Status to Available
            VehicleRent vehicle = booking.getVehicleRent();
            if (vehicle != null) {
                vehicle.setStatus("Available");
                vehicleRentRepository.save(vehicle);
            }
        } else if ("Pending".equalsIgnoreCase(status)) {
            // Just updating metadata (like paymentDate) while staying in Pending status
            payment.setStatus("Pending");
        } else {
            throw new RuntimeException("Invalid Status Action: " + status);
        }

        bookingRepository.save(booking);
        return paymentRepository.save(payment);
    }
}
