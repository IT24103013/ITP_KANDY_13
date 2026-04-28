package com.samarasinghemotors.vehiclesystem.modules.booking.controller;

import com.samarasinghemotors.vehiclesystem.modules.booking.service.CustomerReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class CustomerReportController {

    @Autowired
    private CustomerReportService customerReportService;

    /**
     * GET /api/reports/customer/{customerId}/pdf
     * Returns a 90-day activity PDF report for the given customer.
     * Requires authentication (JWT).
     */
    @GetMapping("/customer/{customerId}/pdf")
    public ResponseEntity<byte[]> getCustomerReport(@PathVariable Integer customerId) {
        try {
            byte[] pdfBytes = customerReportService.generateCustomerReport(customerId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline",
                    "customer_report_" + customerId + ".pdf");
            headers.setContentLength(pdfBytes.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
