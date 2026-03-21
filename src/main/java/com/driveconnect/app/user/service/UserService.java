package com.driveconnect.app.user.service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;


import java.util.List;
import java.util.Map;
import java.util.HashMap;

import com.driveconnect.app.user.entity.User;
import com.driveconnect.app.user.repository.UserRepository;
import com.driveconnect.app.user.dto.RegisterRequestDTO;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;


    public User register(RegisterRequestDTO dto) {

        User user = new User();
        user.setFullName(dto.getFullName());
        user.setEmail(dto.getEmail());

        user.setRole(dto.getRole());
        user.setActive(true);

        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deactivateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow();
        user.setActive(false);
        userRepository.save(user);
    }



    public Map<String, Object> getSummary() {

        Map<String, Object> summary = new HashMap<>();

        summary.put("totalUsers", userRepository.count());
        summary.put("activeUsers", userRepository.countByIsActive(true));
        summary.put("inactiveUsers", userRepository.countByIsActive(false));

        return summary;
    }
}