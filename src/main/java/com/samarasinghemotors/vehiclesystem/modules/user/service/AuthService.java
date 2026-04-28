package com.samarasinghemotors.vehiclesystem.modules.user.service;

import com.samarasinghemotors.vehiclesystem.modules.user.dto.AuthResponseDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.dto.LoginRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.dto.SignupRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Customer;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.User;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.CustomerRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @Autowired
    private com.samarasinghemotors.vehiclesystem.modules.user.security.JwtUtils jwtUtils;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public AuthResponseDTO login(LoginRequestDTO loginRequest) {
        org.springframework.security.core.Authentication authentication = authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(), loginRequest.getPassword()));

        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(loginRequest.getEmail());

        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after authentication"));
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "USER";
        return new AuthResponseDTO(user.getUserId(), user.getFullName(), role, jwt);
    }

    public AuthResponseDTO signupCustomer(SignupRequestDTO signupRequest) {
        if (userRepository.findByEmail(signupRequest.getEmail()).isPresent()) {
            throw new RuntimeException("Email is already registered");
        }

        Customer customer = new Customer();
        customer.setFullName(signupRequest.getFullName());
        customer.setEmail(signupRequest.getEmail());
        customer.setPassword(signupRequest.getPassword());
        customer.setNic(signupRequest.getNic());
        customer.setPhone(signupRequest.getPhone());
        customer.setRole("Customer");
        customer.setLicenseUrl(signupRequest.getLicenseUrl() != null ? signupRequest.getLicenseUrl() : "");

        Customer savedCustomer = customerRepository.save(customer);
        String jwt = jwtUtils.generateJwtToken(savedCustomer.getEmail());

        return new AuthResponseDTO(savedCustomer.getUserId(), savedCustomer.getFullName(), savedCustomer.getRole(), jwt);
    }
}
