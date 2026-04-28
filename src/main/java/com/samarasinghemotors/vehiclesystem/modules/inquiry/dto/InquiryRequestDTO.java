package com.samarasinghemotors.vehiclesystem.modules.inquiry.dto;

public record InquiryRequestDTO(
        Long customerId,
        Long vehicleSaleId,
        String inquiryType,
        String message
) {}
