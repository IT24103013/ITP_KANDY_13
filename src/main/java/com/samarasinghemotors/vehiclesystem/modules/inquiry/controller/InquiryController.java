package com.samarasinghemotors.vehiclesystem.modules.inquiry.controller;

import com.samarasinghemotors.vehiclesystem.modules.inquiry.entity.Inquiry;
import com.samarasinghemotors.vehiclesystem.modules.inquiry.dto.InquiryDetailDTO;
import com.samarasinghemotors.vehiclesystem.modules.inquiry.dto.InquiryRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.dto.TrendingVehicleDTO;
import com.samarasinghemotors.vehiclesystem.modules.inquiry.service.InquiryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inquiries")
@CrossOrigin(origins = "*")
public class InquiryController {

    @Autowired
    private InquiryService inquiryService;

    // Administrative endpoints
    @GetMapping("/admin/all")
    public ResponseEntity<List<InquiryDetailDTO>> getAllAdminInquiries() {
        return ResponseEntity.ok(inquiryService.getAllAdminInquiries());
    }

    @PutMapping("/admin/status")
    public ResponseEntity<?> updateInquiryStatus(@RequestBody Map<String, Object> payload) {
        Integer inquiryId = (Integer) payload.get("inquiryId");
        String status = (String) payload.get("status");
        String adminReply = (String) payload.get("adminReply");
        inquiryService.updateInquiryStatus(inquiryId, status, adminReply);
        return ResponseEntity.ok(Map.of("message", "Inquiry updated successfully"));
    }

    @PostMapping("/admin/finalize-sale")
    public ResponseEntity<?> finalizeSale(@RequestBody Map<String, Integer> payload) {
        Integer vehicleId = payload.get("vehicleId");
        Integer inquiryId = payload.get("inquiryId");
        inquiryService.finalizeVehicleSale(vehicleId, inquiryId);
        return ResponseEntity.ok(Map.of("message", "Sale finalized successfully"));
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteInquiry(@PathVariable Integer id) {
        inquiryService.deleteInquiry(id);
        return ResponseEntity.ok(Map.of("message", "Inquiry deleted successfully"));
    }

    // Customer / Public Endpoints
    @PostMapping("/customer")
    public ResponseEntity<?> submitInquiry(@RequestBody InquiryRequestDTO request) {
        try {
            Inquiry inquiry = inquiryService.submitInquiry(request);
            return ResponseEntity.ok(inquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to submit inquiry: " + e.getMessage());
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<List<TrendingVehicleDTO>> getTrendingVehicles() {
        return ResponseEntity.ok(inquiryService.getTrendingVehiclesReport());
    }
}
