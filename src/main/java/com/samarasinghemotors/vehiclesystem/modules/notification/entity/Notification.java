package com.samarasinghemotors.vehiclesystem.modules.notification.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(nullable = false, length = 50)
    private String type; // PROMO, BOOKING, INFO

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // If userId is null, it's a global notification for everyone
    @Column(name = "user_id")
    private Integer userId;

    public Notification(String message, String type, Integer userId) {
        this.message = message;
        this.type = type;
        this.userId = userId;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }
}
