package com.samarasinghemotors.vehiclesystem.modules.notification.service;

import com.samarasinghemotors.vehiclesystem.modules.notification.entity.Notification;
import com.samarasinghemotors.vehiclesystem.modules.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {
    @Autowired private NotificationRepository notificationRepository;

    public void createGlobalNotification(String message, String type) {
        notificationRepository.save(new Notification(message, type, null));
    }

    public void createPersonalNotification(Integer userId, String message, String type) {
        notificationRepository.save(new Notification(message, type, userId));
    }

    public List<Notification> getNotificationsForUser(Integer userId) {
        return notificationRepository.findByUserOrGlobal(userId);
    }

    public void markAsRead(Integer notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setRead(true);
            notificationRepository.save(n);
        });
    }
}
