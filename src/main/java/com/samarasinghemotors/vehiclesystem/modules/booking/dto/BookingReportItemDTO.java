package com.samarasinghemotors.vehiclesystem.modules.booking.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookingReportItemDTO {

    private Integer bookingId;
    private LocalDate startDate;
    private LocalDate endDate;
    private int rentalDays;
    private String vehicleName;
    private BigDecimal totalCost;
    private String bookingStatus;
    private String paymentStatus; // Approved / Pending / Rejected / Not Paid
}
