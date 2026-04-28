package com.samarasinghemotors.vehiclesystem.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponseDTO {
    private Integer userId;
    private String fullName;
    private String role;
    private String token;
}
