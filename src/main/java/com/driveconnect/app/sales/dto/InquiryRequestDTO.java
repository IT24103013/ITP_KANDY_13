package com.driveconnect.app.sales.dto;

public record InquiryRequestDTO(
        Long vehicleSaleId,
        String inquiryType,
        String message
) {}