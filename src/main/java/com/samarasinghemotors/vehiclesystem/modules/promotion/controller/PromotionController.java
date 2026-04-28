package com.samarasinghemotors.vehiclesystem.modules.promotion.controller;

import com.samarasinghemotors.vehiclesystem.modules.promotion.entity.Promotion;
import com.samarasinghemotors.vehiclesystem.modules.promotion.service.PromotionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    // DTO records
    public record PromotionRequest(String code, BigDecimal discountPercent, String description, LocalDate startDate, LocalDate endDate) {}
    public record CalculateDiscountRequest(BigDecimal basePrice, String promoCode, Integer customerId) {}
    public record CalculateDiscountResponse(BigDecimal finalPrice, BigDecimal basePrice, BigDecimal discountAmount, BigDecimal discountPercent, String appliedPromoCode) {}

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Promotion> createPromotion(@RequestBody PromotionRequest request) {
        Promotion promotion = new Promotion();
        promotion.setCode(request.code());
        promotion.setDiscountPercent(request.discountPercent());
        promotion.setDescription(request.description());
        promotion.setStartDate(request.startDate());
        promotion.setEndDate(request.endDate());
        
        Promotion created = promotionService.createPromotion(promotion);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Promotion> updatePromotion(@PathVariable("id") Integer id, @RequestBody PromotionRequest request) {
        Promotion details = new Promotion();
        details.setCode(request.code());
        details.setDiscountPercent(request.discountPercent());
        details.setDescription(request.description());
        details.setStartDate(request.startDate());
        details.setEndDate(request.endDate());
        
        Promotion updated = promotionService.updatePromotion(id, details);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePromotion(@PathVariable("id") Integer id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/active")
    public ResponseEntity<List<Promotion>> getActivePromotions() {
        return ResponseEntity.ok(promotionService.getAllActivePromotions());
    }

    @GetMapping("/latest")
    public ResponseEntity<Promotion> getLatestPromotion() {
        Promotion latest = promotionService.getLatestActivePromotion();
        if (latest == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(latest);
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<?> validatePromotion(@PathVariable("code") String code, @RequestParam(required = false) Integer customerId) {
        try {
            Promotion validPromo = promotionService.validatePromoCode(code, customerId);
            return ResponseEntity.ok(validPromo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/calculate")
    public ResponseEntity<?> calculateFinalPrice(@RequestBody CalculateDiscountRequest req) {
        try {
            Promotion promo = promotionService.validatePromoCode(req.promoCode(), req.customerId());
            BigDecimal finalPrice = promotionService.calculateFinalPrice(
                    req.basePrice(),
                    req.promoCode(),
                    req.customerId()
            );
            
            BigDecimal discountAmount = req.basePrice().subtract(finalPrice);
            
            return ResponseEntity.ok(new CalculateDiscountResponse(
                    finalPrice, 
                    req.basePrice(), 
                    discountAmount,
                    promo.getDiscountPercent(),
                    promo.getCode()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        }
    }
}
