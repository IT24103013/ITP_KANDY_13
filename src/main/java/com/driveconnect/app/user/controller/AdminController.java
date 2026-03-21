package com.driveconnect.app.user.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;
import java.util.Map;
import com.driveconnect.app.user.entity.User;
import com.driveconnect.app.user.service.UserService;

@RestController
@RequestMapping("/api/admin")
// Updated to port 3000 to match your React frontend
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserService userService;

    // READ: Get all users for the management table
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // READ: Get the summary stats (Total/Active/Inactive) for Dashboard.js
    @GetMapping("/summary")
    public Map<String, Object> getSummary() {
        return userService.getSummary();
    }

    // UPDATE: Deactivate a user (Part of your User Management CRUD)
    @PutMapping("/users/{id}")
    public void deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
    }
}