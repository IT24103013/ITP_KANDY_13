package com.samarasinghemotors.vehiclesystem.modules.user.dto;

import lombok.Data;

@Data
public class CustomerUpdateDTO {
    private String fullName;
    private String phone;
    private String password;
    private String licenseUrl;
}
