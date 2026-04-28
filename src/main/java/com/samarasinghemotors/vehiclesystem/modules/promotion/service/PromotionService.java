package com.samarasinghemotors.vehiclesystem.modules.promotion.service;

import com.samarasinghemotors.vehiclesystem.modules.promotion.entity.Promotion;
import com.samarasinghemotors.vehiclesystem.modules.promotion.repository.PromotionRepository;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationService notificationService;

    public Promotion createPromotion(Promotion promotion) {
        LocalDate today = LocalDate.now();
        if (promotion.getStartDate().isBefore(today)) {
            throw new IllegalArgumentException("Start date cannot be in the past");
        }
        if (promotion.getEndDate().isBefore(promotion.getStartDate())) {
            throw new IllegalArgumentException("End date must be after or on the start date");
        }

        promotion.setCode(promotion.getCode().toUpperCase());

        if (promotionRepository.findByCode(promotion.getCode()).isPresent()) {
            throw new IllegalArgumentException("Promo code already exists");
        }
        
        Promotion saved = promotionRepository.save(promotion);
        
        String message = "Exclusive Offer! Use code " + saved.getCode() + 
                         " to get " + saved.getDiscountPercent() + "% discount. " +
                         "Valid until " + saved.getEndDate() + ".";
        notificationService.createGlobalNotification(message, "PROMO");
        
        return saved;
    }

    public Promotion updatePromotion(Integer id, Promotion details) {
        Promotion existing = promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found"));

        if (details.getEndDate().isBefore(details.getStartDate())) {
            throw new IllegalArgumentException("End date must be after or on the start date");
        }

        existing.setCode(details.getCode().toUpperCase());
        existing.setDiscountPercent(details.getDiscountPercent());
        existing.setDescription(details.getDescription());
        existing.setStartDate(details.getStartDate());
        existing.setEndDate(details.getEndDate());

        return promotionRepository.save(existing);
    }

    public void deletePromotion(Integer id) {
        promotionRepository.deleteById(id);
    }

    public List<Promotion> getAllActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDate.now());
    }

    public Promotion getLatestActivePromotion() {
        LocalDate today = LocalDate.now();
        List<Promotion> promos = promotionRepository.findCurrentActivePromotions(today);
        if (promos.isEmpty()) {
            promos = promotionRepository.findAllPossiblePromotions(today);
        }
        return promos.isEmpty() ? null : promos.get(0);
    }

    public Promotion validatePromoCode(String code, Integer customerId) {
        if (code == null || code.isBlank()) throw new IllegalArgumentException("Promo code is empty");
        
        String searchCode = code.trim().toUpperCase();
        
        Promotion promo = promotionRepository.findByCode(searchCode)
                .orElseGet(() -> promotionRepository.findByCode(code.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Promo code '" + code + "' not found")));

        LocalDate today = LocalDate.now();
        if (promo.getEndDate().isBefore(today)) {
            throw new IllegalArgumentException("Promo code has expired");
        }
        if (promo.getStartDate().isAfter(today)) {
            throw new IllegalArgumentException("Promo code is not yet active");
        }

        // Check if customer has already used this promotion
        if (customerId != null) {
            if (bookingRepository.existsByCustomer_UserIdAndPromotion_PromoId(customerId, promo.getPromoId())) {
                throw new IllegalArgumentException("You have already used this promo code once.");
            }
        }

        return promo;
    }

    public BigDecimal calculateFinalPrice(BigDecimal basePrice, String promoCode, Integer customerId) {
        if (promoCode == null || promoCode.isBlank()) {
            return basePrice;
        }
        Promotion promo = validatePromoCode(promoCode, customerId);
        BigDecimal discountFactor = promo.getDiscountPercent().divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal discountAmount = basePrice.multiply(discountFactor);
        return basePrice.subtract(discountAmount).setScale(2, RoundingMode.HALF_UP);
    }
}
