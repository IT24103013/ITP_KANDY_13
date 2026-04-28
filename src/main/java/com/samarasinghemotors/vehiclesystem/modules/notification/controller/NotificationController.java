package com.samarasinghemotors.vehiclesystem.modules.notification.controller;

import com.samarasinghemotors.vehiclesystem.modules.notification.entity.Notification;
import com.samarasinghemotors.vehiclesystem.modules.notification.service.NotificationService;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.User;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired private NotificationService notificationService;
    @Autowired private UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<Notification>> getMyNotifications(Principal principal) {
        if (principal == null) return ResponseEntity.status(401).build();
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(notificationService.getNotificationsForUser(user.getUserId()));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> markAsRead(@PathVariable Integer id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
