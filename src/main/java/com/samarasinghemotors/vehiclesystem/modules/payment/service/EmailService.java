package com.samarasinghemotors.vehiclesystem.modules.payment.service;

import com.samarasinghemotors.vehiclesystem.modules.booking.entity.Booking;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private TemplateEngine templateEngine;

    @Async
    public void sendApprovalEmail(String to, String customerName, Booking booking, byte[] pdfAttachment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Booking Confirmed! - Your Vehicle is Ready [" + booking.getBookingId() + "]");

            Context context = new Context();
            context.setVariable("customerName", customerName);
            context.setVariable("amount", booking.getTotalCost());
            context.setVariable("vehicleName", booking.getVehicleRent().getName());
            context.setVariable("pickupDate", booking.getStartDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));
            context.setVariable("returnDate", booking.getEndDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")));

            String htmlContent = templateEngine.process("payment-approved", context);
            helper.setText(htmlContent, true);

            helper.addAttachment("Invoice-" + booking.getBookingId() + ".pdf", new ByteArrayResource(pdfAttachment));

            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to send approval email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendRejectionEmail(String to, String customerName, String bookingId, String remarks) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Update Regarding Your Payment - [" + bookingId + "]");

            Context context = new Context();
            context.setVariable("customerName", customerName);
            context.setVariable("bookingId", bookingId);
            context.setVariable("remarks", remarks);

            String htmlContent = templateEngine.process("payment-rejected", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to send rejection email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendInquiryUpdateEmail(String to, String customerName, String vehicleName, String status, String remarks) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Update Regarding Your Vehicle Inquiry: " + vehicleName);

            Context context = new Context();
            context.setVariable("customerName", customerName);
            context.setVariable("vehicleName", vehicleName);
            context.setVariable("status", status);
            context.setVariable("remarks", remarks);

            String htmlContent = templateEngine.process("inquiry-update", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to send inquiry update email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Async
    public void sendPasswordResetEmail(String to, String customerName, String resetLink) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(to);
            helper.setSubject("Reset Your Password - Samarasinghe Motors");

            Context context = new Context();
            context.setVariable("customerName", customerName);
            context.setVariable("resetLink", resetLink);

            String htmlContent = templateEngine.process("password-reset", context);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
