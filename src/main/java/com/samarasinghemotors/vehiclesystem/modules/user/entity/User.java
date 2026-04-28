package com.samarasinghemotors.vehiclesystem.modules.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "full_name")
    private String fullName;
    private String email;
    private String password;
    private String nic;
    @Column(name = "phone", nullable = false, length = 15)
    private String phone;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE"; // "ACTIVE" or "BLOCKED"

    private String role;
}