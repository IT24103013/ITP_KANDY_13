package com.samarasinghemotors.vehiclesystem.modules.booking.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.samarasinghemotors.vehiclesystem.modules.booking.dto.BookingReportItemDTO;
import com.samarasinghemotors.vehiclesystem.modules.booking.dto.CustomerReportDTO;
import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.entity.Payment;
import com.samarasinghemotors.vehiclesystem.modules.payment.repository.PaymentRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.User;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CustomerReportService {

    private static final int FREQUENT_RENTER_THRESHOLD = 3;
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd, yyyy");

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Generate a 90-day activity PDF report for a given customer.
     */
    public byte[] generateCustomerReport(Integer customerId) {
        // 1. Fetch Customer info
        User user = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));

        // 2. Calculate 90-day window
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from = to.minusDays(90);

        // 3. Fetch bookings in range
        List<Booking> bookings = bookingRepository.findByCustomerInDateRange(customerId, from, to);

        // 4. Fetch all payments for this customer to map booking → payment status
        List<Payment> allPayments = paymentRepository.findByBooking_Customer_UserIdOrderByPaymentDateDesc(customerId);
        Map<Integer, Payment> latestPaymentByBooking = allPayments.stream()
                .collect(Collectors.toMap(
                        p -> p.getBooking().getBookingId(),
                        p -> p,
                        (existing, replacement) -> existing // keep latest (list is already sorted desc)
                ));

        // 5. Build report items
        List<BookingReportItemDTO> items = new ArrayList<>();
        BigDecimal totalRevenue = BigDecimal.ZERO;
        int confirmedCount = 0;

        for (Booking b : bookings) {
            BookingReportItemDTO item = new BookingReportItemDTO();
            item.setBookingId(b.getBookingId());
            item.setStartDate(b.getStartDate());
            item.setEndDate(b.getEndDate());
            item.setRentalDays(b.getEndDate().compareTo(b.getStartDate()));
            item.setVehicleName(b.getVehicleRent() != null ? b.getVehicleRent().getName() : "N/A");
            item.setTotalCost(b.getTotalCost());
            item.setBookingStatus(b.getBookingStatus());

            Payment payment = latestPaymentByBooking.get(b.getBookingId());
            String paymentStatus = (payment != null) ? payment.getStatus() : "Not Paid";
            item.setPaymentStatus(paymentStatus);

            if ("Confirmed".equalsIgnoreCase(b.getBookingStatus())) {
                confirmedCount++;
                if ("Approved".equalsIgnoreCase(paymentStatus) && b.getTotalCost() != null) {
                    totalRevenue = totalRevenue.add(b.getTotalCost());
                }
            }
            items.add(item);
        }

        // 6. Build DTO
        CustomerReportDTO report = new CustomerReportDTO();
        report.setUserId(user.getUserId());
        report.setCustomerName(user.getFullName());
        report.setPhone(user.getPhone());
        report.setEmail(user.getEmail());
        report.setReportFrom(from.toLocalDate());
        report.setReportTo(to.toLocalDate());
        report.setBookings(items);
        report.setTotalRevenue(totalRevenue);
        report.setTotalConfirmedBookings(confirmedCount);
        report.setLoyaltyStatus(confirmedCount >= FREQUENT_RENTER_THRESHOLD ? "⭐ Frequent Renter" : "Regular Customer");

        // 7. Build HTML and convert to PDF
        String html = buildHtml(report);
        return convertHtmlToPdf(html);
    }

    private String buildHtml(CustomerReportDTO r) {
        String bookingRows = r.getBookings().isEmpty()
                ? "<tr><td colspan='6' style='text-align:center;color:#888;padding:20px;'>No bookings found in this period.</td></tr>"
                : r.getBookings().stream().map(b -> {
            return String.format("""
                <tr>
                    <td>#%d</td>
                    <td>%s</td>
                    <td>%s to %s</td>
                    <td style='text-align:center;'>%d</td>
                    <td style='text-align:right;'>LKR %s</td>
                    <td style='text-align:center;'>%s</td>
                </tr>
                """,
                    b.getBookingId(),
                    b.getVehicleName(),
                    b.getStartDate() != null ? b.getStartDate().format(DATE_FMT) : "-",
                    b.getEndDate() != null ? b.getEndDate().format(DATE_FMT) : "-",
                    b.getRentalDays(),
                    b.getTotalCost() != null ? String.format("%,.2f", b.getTotalCost()) : "0.00",
                    b.getBookingStatus() + " (" + b.getPaymentStatus() + ")"
            );
        }).collect(Collectors.joining("\n"));

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8"/>
                <style>
                    body { font-family: 'Helvetica', 'Arial', sans-serif; color: #333; line-height: 1.4; padding: 40px; }
                    .report-header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 30px; }
                    .report-title { font-size: 24px; font-weight: bold; text-transform: uppercase; }
                    .company-name { font-size: 16px; color: #666; }
                    
                    .info-section { margin-bottom: 30px; }
                    .info-grid { width: 100%%; }
                    .info-label { font-weight: bold; width: 150px; color: #555; }
                    
                    .section-heading { font-size: 16px; font-weight: bold; background: #f0f0f0; padding: 8px 12px; margin-bottom: 15px; border-left: 4px solid #333; }
                    
                    table { width: 100%%; border-collapse: collapse; margin-bottom: 30px; }
                    th { border-bottom: 2px solid #333; padding: 10px; text-align: left; font-size: 12px; text-transform: uppercase; }
                    td { border-bottom: 1px solid #ddd; padding: 10px; font-size: 12px; }
                    
                    .summary-box { border: 1px solid #333; padding: 20px; background: #fafafa; }
                    .summary-item { margin-bottom: 10px; font-size: 14px; }
                    .summary-value { font-weight: bold; float: right; }
                    
                    .footer { margin-top: 50px; font-size: 10px; color: #999; border-top: 1px solid #ddd; padding-top: 10px; text-align: center; }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <div class="report-title">Customer Activity Report</div>
                    <div class="company-name">SAMARASINGHE MOTORS - Analytical Insights</div>
                </div>

                <div class="info-section">
                    <div class="section-heading">Customer Identification</div>
                    <table class="info-grid">
                        <tr>
                            <td class="info-label">Full Name:</td><td>%s</td>
                            <td class="info-label">User ID:</td><td>#%d</td>
                        </tr>
                        <tr>
                            <td class="info-label">Contact:</td><td>%s</td>
                            <td class="info-label">Report Window:</td><td>%s to %s</td>
                        </tr>
                    </table>
                </div>

                <div class="section-heading">Transactional Details</div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Vehicle Detail</th>
                            <th>Rental Range</th>
                            <th style='text-align:center;'>Days</th>
                            <th style='text-align:right;'>Cost</th>
                            <th style='text-align:center;'>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        %s
                    </tbody>
                </table>

                <div class="section-heading">Executive Summary</div>
                <div class="summary-box">
                    <div class="summary-item">Total Revenue (Last 90 Days): <span class="summary-value">LKR %s</span></div>
                    <div class="summary-item">Total Successful Bookings: <span class="summary-value">%d</span></div>
                    <div class="summary-item">Customer Loyalty Status: <span class="summary-value">%s</span></div>
                </div>

                <div class="footer">
                    This document is a system-generated analytical report for internal use.
                    <br/>Generated on %s
                </div>
            </body>
            </html>
            """,
                r.getCustomerName(),
                r.getUserId(),
                (r.getPhone() != null ? r.getPhone() : "N/A") + " | " + (r.getEmail() != null ? r.getEmail() : "N/A"),
                r.getReportFrom().format(DATE_FMT),
                r.getReportTo().format(DATE_FMT),
                bookingRows,
                String.format("%,.2f", r.getTotalRevenue()),
                r.getTotalConfirmedBookings(),
                r.getLoyaltyStatus(),
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
        );
    }

    private String getPaymentStatusColor(String status) {
        if (status == null) return "#888888";
        return switch (status.toLowerCase()) {
            case "approved" -> "#2d7a4f";
            case "rejected" -> "#c0392b";
            case "pending" -> "#d68910";
            default -> "#4a5270";
        };
    }

    private String getBookingStatusColor(String status) {
        if (status == null) return "#888888";
        return switch (status.toLowerCase()) {
            case "confirmed" -> "#1a6aa0";
            case "cancelled" -> "#c0392b";
            default -> "#888888";
        };
    }

    private byte[] convertHtmlToPdf(String html) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.withHtmlContent(html, null);
            builder.toStream(baos);
            builder.run();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }
    }
}
