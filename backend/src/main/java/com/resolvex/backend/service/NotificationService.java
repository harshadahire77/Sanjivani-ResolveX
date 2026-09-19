package com.resolvex.backend.service;

import com.resolvex.backend.model.Notification;
import com.resolvex.backend.model.User;
import com.resolvex.backend.repository.NotificationRepository;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(
            NotificationRepository notificationRepository
    ) {
        this.notificationRepository =
                notificationRepository;
    }

    public void createNotification(
            User user,
            String title,
            String message,
            String type,
            Long complaintId
    ) {

        if (user == null) {
            return;
        }

        Notification notification =
                new Notification();

        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setComplaintId(
                complaintId
        );
        notification.setRead(false);

        notificationRepository.save(
                notification
        );
    }
}