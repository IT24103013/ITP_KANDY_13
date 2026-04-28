package com.samarasinghemotors.vehiclesystem.modules.payment.service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import com.samarasinghemotors.vehiclesystem.modules.payment.entity.Payment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Service
public class PdfGenerationService {

    @Autowired
    private TemplateEngine templateEngine;

    public byte[] generateInvoicePdf(Booking booking, Payment payment) {
        try {
            Context context = new Context();
            
            // Populate data for the Thymeleaf template
            context.setVariable("customerName", booking.getCustomer().getFullName());
            context.setVariable("customerPhone", booking.getCustomer().getPhone());
            context.setVariable("customerEmail", booking.getCustomer().getEmail());
            
            context.setVariable("invoiceNumber", "INV-2026-" + String.format("%04d", payment.getPaymentId()));
            context.setVariable("invoiceDate", java.time.LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
            context.setVariable("bookingId", booking.getBookingId());
            
            context.setVariable("vehicleName", booking.getVehicleRent().getName());
            context.setVariable("dailyRate", booking.getVehicleRent().getDailyRate());
            
            long days = ChronoUnit.DAYS.between(booking.getStartDate(), booking.getEndDate());
            if (days == 0) days = 1; // Minimum 1 day
            context.setVariable("days", days);
            
            context.setVariable("vehicleAmount", booking.getVehicleRent().getDailyRate().multiply(java.math.BigDecimal.valueOf(days)));
            
            context.setVariable("subTotal", booking.getTotalCost());
            // Assuming no discount variable mapped yet, or 0
            context.setVariable("discount", 0);
            context.setVariable("totalPaid", payment.getAmount());

            // Render HTML
            String htmlContent = templateEngine.process("invoice-template", context);

            // Convert HTML to PDF using OpenHTMLToPDF
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, "classpath:/templates/");
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF invoice", e);
        }
    }
}
