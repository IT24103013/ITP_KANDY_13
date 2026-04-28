package com.samarasinghemotors.vehiclesystem.modules.payment.controller;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.entity.Payment;
import com.samarasinghemotors.vehiclesystem.modules.payment.repository.PaymentRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.service.PaymentService;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.dto.PaymentReviewDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private com.samarasinghemotors.vehiclesystem.modules.payment.service.PdfGenerationService pdfGenerationService;

    private static final String UPLOAD_DIRECTORY = System.getProperty("user.dir") + "/uploads";

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPayment(
            @RequestParam("bookingId") Integer bookingId,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("paymentDate") @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate paymentDate,
            @RequestParam("file") MultipartFile file) {

        // Validate File Type
        String contentType = file.getContentType();
        List<String> allowedTypes = Arrays.asList("image/jpeg", "image/png", "application/pdf");
        if (contentType == null || !allowedTypes.contains(contentType)) {
            return ResponseEntity.status(400).body("Error: Only JPG, PNG, and PDF files are allowed.");
        }

        // Validate Payment Date
        if (paymentDate.isBefore(LocalDate.now())) {
            return ResponseEntity.status(400).body("Error: Payment date cannot be in the past.");
        }

        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found!"));

            File directory = new File(UPLOAD_DIRECTORY);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path fileNameAndPath = Paths.get(UPLOAD_DIRECTORY, fileName);
            Files.write(fileNameAndPath, file.getBytes());

            Payment payment = new Payment();
            payment.setBooking(booking);
            payment.setAmount(amount);
            payment.setPaymentDate(paymentDate);
            payment.setBankSlipUrl("/uploads/" + fileName);
            payment.setStatus("Pending"); // Default status

            paymentRepository.save(payment);

            return ResponseEntity.ok("Payment Uploaded Successfully. Waiting for Admin Approval");

        } catch (IOException e) {
            return ResponseEntity.status(500).body("File upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingPayments() {
        List<Payment> pendingPayments = paymentRepository.findByStatus("Pending");
        return ResponseEntity.ok(pendingPayments);
    }

    @PutMapping("/{paymentId}/review")
    public ResponseEntity<?> reviewPayment(
            @PathVariable Integer paymentId,
            @RequestBody PaymentReviewDTO reviewDTO) {

        try {
            paymentService.reviewPayment(paymentId, reviewDTO.getStatus(), reviewDTO.getRemarks(), reviewDTO.getPaymentDate());
            return ResponseEntity.ok("Payment " + reviewDTO.getStatus() + " successfully.");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing payment: " + e.getMessage());
        }
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<?> getPaymentHistoryByCustomer(@PathVariable Integer customerId) {
        try {
            List<Payment> history = paymentRepository.findByBooking_Customer_UserIdOrderByPaymentDateDesc(customerId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving customer payment history: " + e.getMessage());
        }
    }

    @GetMapping("/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPayments() {
        try {
            List<Payment> history = paymentRepository.findAllByOrderByPaymentDateDesc();
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error retrieving all payment history: " + e.getMessage());
        }
    }

    @GetMapping("/{paymentId}/invoice")
    public ResponseEntity<byte[]> getInvoice(@PathVariable Integer paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new RuntimeException("Payment not found"));

            // Check if status is approved before allowing invoice download
            if (!"Approved".equalsIgnoreCase(payment.getStatus())) {
                return ResponseEntity.status(403).build();
            }

            byte[] pdfBytes = pdfGenerationService.generateInvoicePdf(payment.getBooking(), payment);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Invoice-" + paymentId + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}