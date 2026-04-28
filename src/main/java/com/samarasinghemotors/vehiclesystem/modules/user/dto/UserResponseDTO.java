package com.samarasinghemotors.vehiclesystem.modules.user.dto;

import lombok.Data;

@Data
public class UserResponseDTO {
    private Integer userId;
    private String fullName;
    private String email;
    private String nic;
    private String phone;
    private String role;
    private String status;
    private String licenseUrl;
}
