package com.samarasinghemotors.vehiclesystem.modules.booking.dto;

import lombok.Getter;
import lombok.Setter;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class BookingRequestDTO {
    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleRentId;

    @NotNull(message = "Start date is required")
    @FutureOrPresent(message = "Start date must be today or in the future")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    @FutureOrPresent(message = "End date must be today or in the future")
    private LocalDate endDate;

    @NotNull(message = "Total cost is required")
    private BigDecimal totalCost;

    private String promoCode;
}