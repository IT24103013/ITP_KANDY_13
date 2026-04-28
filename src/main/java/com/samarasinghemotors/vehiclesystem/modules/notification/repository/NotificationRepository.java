package com.samarasinghemotors.vehiclesystem.modules.notification.repository;

import com.samarasinghemotors.vehiclesystem.modules.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    @Query("SELECT n FROM Notification n WHERE n.userId IS NULL OR n.userId = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByUserOrGlobal(@Param("userId") Integer userId);
}
