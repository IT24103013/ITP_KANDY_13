package com.samarasinghemotors.vehiclesystem.modules.user.controller;

import com.samarasinghemotors.vehiclesystem.modules.user.dto.AdminUserUpdateDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.dto.CustomerUpdateDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.dto.UserResponseDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(userService.getUserById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/customer")
    public ResponseEntity<?> updateCustomer(@PathVariable Integer id, @RequestBody CustomerUpdateDTO dto) {
        try {
            UserResponseDTO updated = userService.updateCustomer(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<?> updateUserByAdmin(@PathVariable Integer id, @RequestBody AdminUserUpdateDTO dto) {
        try {
            UserResponseDTO updated = userService.updateUserByAdmin(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
