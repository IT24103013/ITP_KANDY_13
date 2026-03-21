package com.driveconnect.app.user.controller;

import com.driveconnect.app.user.entity.User;
import com.driveconnect.app.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*") // Allows React to communicate
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/register") // Added "/register" here
    public User createUser(@RequestBody User user) {
        if (user.getRole() == null) user.setRole("CUSTOMER");
        user.setActive(true); // Ensure new users are active by default
        return userRepository.save(user);
    }

    // UPDATED: Simplified toggle logic
    @PutMapping("/{id}/status")
    public ResponseEntity<User> toggleStatus(@PathVariable Long id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setActive(!user.isActive()); // Flips true to false, or false to true
                    return ResponseEntity.ok(userRepository.save(user));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if(userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        return userRepository.findAll().stream()
                .filter(u -> u.getEmail().equals(loginRequest.getEmail()) &&
                        u.getPassword().equals(loginRequest.getPassword()))
                .findFirst()
                .map(user -> {
                    if ("ADMIN".equalsIgnoreCase(user.getRole())) {
                        return ResponseEntity.ok(user); // Success
                    } else {
                        return ResponseEntity.status(403).body("Access Denied: Not an Admin");
                    }
                })
                .orElse(ResponseEntity.status(401).body("Invalid Email or Password"));
    }
}