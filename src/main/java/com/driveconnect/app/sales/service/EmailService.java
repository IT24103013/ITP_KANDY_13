package com.driveconnect.app.sales.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendInquiryUpdateEmail(String toEmail, String customerName, String carName, String status, String adminMessage) {
        try {
            // 1. Create a MIME message (Allows HTML styling)
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Update on your vehicle inquiry: " + carName);

            // 2. Build the HTML String
            String htmlContent = "<div style='font-family: Arial, sans-serif; background-color: #f5f3ef; padding: 40px 20px;'>"
                    + "<div style='max-width: 600px; margin: 0 auto; background-color: #16181c; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.2);'>"

                    // Header
                    + "<div style='background-color: #0a0c0f; padding: 25px; text-align: center; border-bottom: 3px solid #dfb771;'>"
                    + "<h1 style='color: #dfb771; margin: 0; font-size: 26px; letter-spacing: 1px;'>SAMARASINGHE MOTORS</h1>"
                    + "</div>"

                    // Body
                    + "<div style='padding: 30px;'>"
                    + "<h2 style='color: #ffffff; margin-top: 0; font-size: 20px;'>Hello " + customerName + ",</h2>"
                    + "<p style='color: #9ca3af; font-size: 15px; line-height: 1.6;'>There is an update regarding your recent inquiry for the <strong>" + carName + "</strong>.</p>"

                    // Status Box
                    + "<div style='background-color: #1c1f26; border: 1px solid #2d323b; padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;'>"
                    + "<p style='margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;'>Current Status</p>"
                    + "<p style='margin: 8px 0 0 0; color: #dfb771; font-size: 22px; font-weight: bold;'>" + status + "</p>"
                    + "</div>";

            // Admin Message Box Only shows if admin actually typed a message
            if (adminMessage != null && !adminMessage.isEmpty()) {
                htmlContent += "<div style='background-color: #1c1f26; border-left: 4px solid #dfb771; padding: 20px; border-radius: 4px 12px 12px 4px; margin-bottom: 25px;'>"
                        + "<p style='margin: 0; color: #9ca3af; font-size: 12px; text-transform: uppercase; font-weight: bold; margin-bottom: 8px;'>Message from Administration:</p>"
                        + "<p style='margin: 0; color: #ffffff; font-style: italic; line-height: 1.6;'>\"" + adminMessage + "\"</p>"
                        + "</div>";
            }

            // Footer
            htmlContent += "<p style='color: #9ca3af; font-size: 14px; line-height: 1.6;'>If you have any questions, please reply directly to this email or visit our showroom.</p>"
                    + "<hr style='border: none; border-top: 1px solid #2d323b; margin: 30px 0 20px 0;' />"
                    + "<p style='color: #6b7280; font-size: 12px; text-align: center; margin: 0;'>© 2026 Samarasinghe Motors. All rights reserved.</p>"
                    + "</div></div></div>";

            // 3. Set the content and specify "true" to send as HTML
            helper.setText(htmlContent, true);

            // 4. Send it!
            mailSender.send(message);
            System.out.println("HTML Email sent successfully to: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Failed to send HTML email: " + e.getMessage());
        }
    }
}