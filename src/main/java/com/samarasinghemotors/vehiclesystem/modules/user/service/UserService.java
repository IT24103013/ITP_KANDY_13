package com.samarasinghemotors.vehiclesystem.modules.user.service;

import com.samarasinghemotors.vehiclesystem.modules.user.dto.AdminUserUpdateDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.dto.CustomerUpdateDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.dto.UserResponseDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Customer;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.User;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.CustomerRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public UserResponseDTO getUserById(Integer id) {
        return userRepository.findById(id).map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    @Transactional
    public UserResponseDTO updateCustomer(Integer id, CustomerUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(dto.getPassword());
        }

        if (user instanceof Customer customer) {
            if (dto.getLicenseUrl() != null) {
                customer.setLicenseUrl(dto.getLicenseUrl());
            }
            customerRepository.save(customer);
            return mapToDTO(customer);
        }

        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Transactional
    public UserResponseDTO updateUserByAdmin(Integer id, AdminUserUpdateDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));

        user.setFullName(dto.getFullName());
        user.setPhone(dto.getPhone());
        if (dto.getNic() != null) user.setNic(dto.getNic());
        if (dto.getRole() != null) user.setRole(dto.getRole());
        if (dto.getStatus() != null) user.setStatus(dto.getStatus());
        
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(dto.getPassword()); // In a real app, hash this!
        }

        User updatedUser = userRepository.save(user);
        return mapToDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found: " + id);
        }
        userRepository.deleteById(id);
    }

    private UserResponseDTO mapToDTO(User user) {
        UserResponseDTO dto = new UserResponseDTO();
        dto.setUserId(user.getUserId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setNic(user.getNic());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole() != null ? user.getRole().toUpperCase() : "USER");
        dto.setStatus(user.getStatus());

        if (user instanceof Customer customer) {
            dto.setLicenseUrl(customer.getLicenseUrl());
        }

        return dto;
    }
}
