package com.samarasinghemotors.vehiclesystem.modules.booking.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class CustomerReportDTO {

    private Integer userId;
    private String customerName;
    private String phone;
    private String email;

    private LocalDate reportFrom;
    private LocalDate reportTo;

    private List<BookingReportItemDTO> bookings;

    private BigDecimal totalRevenue;
    private int totalConfirmedBookings;
    private String loyaltyStatus; // "⭐ Frequent Renter" or "Regular Customer"
}
