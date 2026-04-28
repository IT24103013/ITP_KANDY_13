package com.samarasinghemotors.vehiclesystem.modules.estimator.service;

import com.samarasinghemotors.vehiclesystem.modules.estimator.dto.EstimatorRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.estimator.dto.EstimatorResponseDTO;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;

@Service
public class EstimatorService {

    // Dynamic mock fuel price - in real life fetched from DB or Config
    private final Double CURRENT_FUEL_PRICE = 380.0;

    public EstimatorResponseDTO calculateTotalCost(EstimatorRequestDTO request) {
        
        // 1. Obtain Distance (Passed from Frontend OSRM or fallback to mock)
        Double distanceKm = (request.distanceKm() != null && request.distanceKm() > 0) 
            ? request.distanceKm() 
            : generateMockDistance(request.origin(), request.destination());
        
        // 2. Calculate Fuel Cost
        Double fuelRequiredLiters = 0.0;
        Double estimatedFuelCost = 0.0;
        
        if (request.avgFuelEfficiency() != null && request.avgFuelEfficiency() > 0) {
            fuelRequiredLiters = distanceKm / request.avgFuelEfficiency();
            estimatedFuelCost = fuelRequiredLiters * CURRENT_FUEL_PRICE;
        }

        // 3. Calculate Rental Cost
        Integer rentalDays = 0;
        Double estimatedRentalCost = 0.0;
        if (request.startDate() != null && request.endDate() != null) {
            long daysBetween = ChronoUnit.DAYS.between(request.startDate(), request.endDate());
            rentalDays = (int) Math.max(1, daysBetween + 1); 
            if (request.dailyRate() != null) {
                estimatedRentalCost = rentalDays * request.dailyRate();
            }
        }

        // 4. Calculate Grand Total
        Double grandTotal = estimatedFuelCost + estimatedRentalCost;

        return new EstimatorResponseDTO(
                Math.round(distanceKm * 10.0) / 10.0,
                Math.round(fuelRequiredLiters * 10.0) / 10.0,
                CURRENT_FUEL_PRICE,
                Math.round(estimatedFuelCost * 100.0) / 100.0,
                rentalDays,
                Math.round(estimatedRentalCost * 100.0) / 100.0,
                Math.round(grandTotal * 100.0) / 100.0
        );
    }

    private Double generateMockDistance(String origin, String destination) {
        if (origin == null || destination == null || origin.isBlank() || destination.isBlank()) {
            return 0.0;
        }
        int hash = Math.abs(origin.toLowerCase().hashCode() + destination.toLowerCase().hashCode());
        // Yield distance between 15 km and 250 km based on locations mapped
        return 15.0 + (hash % 235);
    }
}
