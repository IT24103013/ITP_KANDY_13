package com.samarasinghemotors.vehiclesystem.modules.user.service;

import com.samarasinghemotors.vehiclesystem.modules.user.entity.PasswordResetToken;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.User;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.PasswordResetTokenRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.UserRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional
    public void createPasswordResetToken(String email, String baseUrl) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with this email not found."));

        // Delete existing tokens for this user if any
        tokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken myToken = new PasswordResetToken(token, user, 15); // 15 mins expiry
        tokenRepository.save(myToken);

        String resetLink = baseUrl + "/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);
    }

    public String validatePasswordResetToken(String token) {
        Optional<PasswordResetToken> passToken = tokenRepository.findByToken(token);

        if (passToken.isEmpty()) {
            return "invalidToken";
        }
        if (passToken.get().isExpired()) {
            return "expired";
        }
        return null;
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken passToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid token."));

        if (passToken.isExpired()) {
            throw new IllegalArgumentException("Token has expired.");
        }

        User user = passToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete token after successful reset
        tokenRepository.delete(passToken);
    }
}
