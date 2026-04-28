package com.samarasinghemotors.vehiclesystem.modules.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "customer")
@PrimaryKeyJoinColumn(name = "user_id")
@Getter
@Setter
public class Customer extends User {
    @Column(name = "license_url")
    private String licenseUrl;
}