package com.driveconnect.app.sales.controller;

import com.driveconnect.app.sales.dto.VehicleSaleDTO;
import com.driveconnect.app.sales.dto.InquiryRequestDTO;
import com.driveconnect.app.sales.dto.InquiryDetailDTO;
import com.driveconnect.app.sales.dto.AdminReplyDTO;
import com.driveconnect.app.sales.dto.TrendingVehicleDTO;
import com.driveconnect.app.sales.repository.SalesRepository;
import com.driveconnect.app.sales.service.EmailService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:5173")
public class SalesController {

    private final SalesRepository salesRepository;
    private final EmailService emailService;

    public SalesController(SalesRepository salesRepository, EmailService emailService) {
        this.salesRepository = salesRepository;
        this.emailService = emailService;
    }
// public

    @GetMapping("/vehicles")
    public List<VehicleSaleDTO> getAllVehicles() {
        return salesRepository.getAllAvailableVehicles();
    }

    @GetMapping("/search")
    public List<VehicleSaleDTO> searchVehicles(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer yearReg,
            @RequestParam(required = false) String bodyType,
            @RequestParam(required = false) Integer mileage) {

        return salesRepository.searchVehicles(brand, model, condition, transmission, maxPrice, yearReg, bodyType, mileage);
    }

    @GetMapping("/vehicles/{id}")
    public ResponseEntity<VehicleSaleDTO> getVehicleDetails(@PathVariable int id) {
        VehicleSaleDTO vehicle = salesRepository.getVehicleById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/inquire")
    public ResponseEntity<String> submitInquiry(@RequestBody InquiryRequestDTO inquiry) {
        Long currentUserId = 1L; // Until user management is integrated later
        salesRepository.saveInquiry(
                currentUserId,
                inquiry.vehicleSaleId(),
                inquiry.inquiryType(),
                inquiry.message()
        );
        return ResponseEntity.ok("Inquiry saved successfully");
    }

// admin

    @GetMapping("/admin/inquiries")
    public List<InquiryDetailDTO> getAdminInquiries() {
        return salesRepository.getAllAdminInquiries();
    }

    @PutMapping("/admin/inquiries/{id}")
    public ResponseEntity<String> updateInquiry(@PathVariable Long id, @RequestBody AdminReplyDTO replyDTO) {
        // 1. Update Database
        salesRepository.updateInquiryStatus(id, replyDTO.status(), replyDTO.adminReply());

        // 2. Fetch Details & Send Email!
        try {
            Map<String, String> details = salesRepository.getEmailDetailsForInquiry(id);
            emailService.sendInquiryUpdateEmail(
                    details.get("email"), details.get("name"), details.get("car"),
                    replyDTO.status(), replyDTO.adminReply()
            );
        } catch (Exception e) {
            System.out.println("Failed to send email: " + e.getMessage());
            // print the error but don't crash the app if the email fails
        }

        return ResponseEntity.ok("Inquiry updated and email sent successfully");
    }

    @DeleteMapping("/admin/inquiries/{id}")
    public ResponseEntity<String> deleteInquiry(@PathVariable Long id) {
        salesRepository.deleteInquiry(id);
        return ResponseEntity.ok("Inquiry deleted successfully");
    }
    
    @PostMapping("/admin/finalize-sale")
    public ResponseEntity<String> finalizeSale(@RequestParam Long vehicleId, @RequestParam Long inquiryId) {
        // 1. Mark the vehicle as SOLD
        salesRepository.finalizeVehicleSale(vehicleId);

        // 2. Mark the winning buyer as ACCEPTED
        salesRepository.updateInquiryStatus(inquiryId, "ACCEPTED", "Congratulations, the sale is finalized! Please visit our showroom to complete the paperwork.");

        // 3. Automatically REJECT all other inquiries for this same car
        salesRepository.rejectOtherInquiriesForVehicle(vehicleId, inquiryId);

        // 4. Send Email to the winner
        try {
            Map<String, String> details = salesRepository.getEmailDetailsForInquiry(inquiryId);
            emailService.sendInquiryUpdateEmail(
                    details.get("email"), details.get("name"), details.get("car"),
                    "SOLD to YOU", "Congratulations, the sale is finalized! Please visit our showroom to complete the paperwork."
            );
        } catch (Exception e) {
            System.out.println("Failed to send email: " + e.getMessage());
        }

        return ResponseEntity.ok("Sale finalized. Vehicle removed from available inventory and other inquiries rejected.");
    }

    @GetMapping("/admin/report/trending")
    public List<TrendingVehicleDTO> getTrendingReport() {
        return salesRepository.getTrendingVehiclesReport();
    }
}