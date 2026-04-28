package com.samarasinghemotors.vehiclesystem.modules.user.repository;

import com.samarasinghemotors.vehiclesystem.modules.user.entity.PasswordResetToken;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByUser(User user);
    void deleteByToken(String token);
    void deleteByUser(User user);
}
