package com.samarasinghemotors.vehiclesystem.modules.payment.dto;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class PaymentReviewDTO {
    private Integer paymentId;
    private String status;
    private String remarks;
    private LocalDate paymentDate;
}