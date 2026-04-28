package com.samarasinghemotors.vehiclesystem.modules.estimator.dto;

import java.time.LocalDate;

public record EstimatorRequestDTO(
    String origin,
    String destination,
    LocalDate startDate,
    LocalDate endDate,
    Integer vehicleId,
    Double dailyRate,
    Double avgFuelEfficiency,
    Double distanceKm
) {}
