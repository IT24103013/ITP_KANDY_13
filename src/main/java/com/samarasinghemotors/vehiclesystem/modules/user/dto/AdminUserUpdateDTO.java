package com.samarasinghemotors.vehiclesystem.modules.user.dto;

import lombok.Data;

@Data
public class AdminUserUpdateDTO {
    private String fullName;
    private String phone;
    private String nic;
    private String role;
    private String status;
    private String password;
}
