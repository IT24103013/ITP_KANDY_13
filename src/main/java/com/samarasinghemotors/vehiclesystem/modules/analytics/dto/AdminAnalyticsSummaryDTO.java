package com.samarasinghemotors.vehiclesystem.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminAnalyticsSummaryDTO {
    private BigDecimal totalRevenue;
    private long totalBookings;
    private long totalUsers;
    private long totalVehicles;
    private Map<String, Long> bookingsByStatus;
    private Map<String, Long> vehiclesByType;
    private Map<String, Long> usersByRole;
}
