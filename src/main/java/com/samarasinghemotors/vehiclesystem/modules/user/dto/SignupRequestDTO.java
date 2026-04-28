package com.samarasinghemotors.vehiclesystem.modules.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequestDTO {
    private String fullName;
    private String email;
    private String password;
    private String nic;
    private String phone;
    private String licenseUrl;
}
