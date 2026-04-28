package com.samarasinghemotors.vehiclesystem.modules.estimator.dto;

public record EstimatorResponseDTO(
    Double distanceKm,
    Double fuelRequiredLiters,
    Double currentFuelPrice,
    Double estimatedFuelCost,
    Integer rentalDays,
    Double estimatedRentalCost,
    Double grandTotal
) {}
