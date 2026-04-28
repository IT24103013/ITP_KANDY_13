package com.samarasinghemotors.vehiclesystem.modules.promotion.repository;

import com.samarasinghemotors.vehiclesystem.modules.promotion.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Integer> {
    Optional<Promotion> findByCode(String code);
    
    @Query("SELECT p FROM Promotion p WHERE p.endDate >= :today ORDER BY p.startDate DESC")
    List<Promotion> findActivePromotions(@Param("today") LocalDate today);

    // Get any promotion that is currently within its validity period
    @Query("SELECT p FROM Promotion p WHERE p.startDate <= :today AND p.endDate >= :today ORDER BY p.promoId DESC")
    List<Promotion> findCurrentActivePromotions(@Param("today") LocalDate today);
    
    // Fallback search to find any promo ending today or in future just in case
    @Query("SELECT p FROM Promotion p WHERE p.endDate >= :today ORDER BY p.promoId DESC")
    List<Promotion> findAllPossiblePromotions(@Param("today") LocalDate today);
}
