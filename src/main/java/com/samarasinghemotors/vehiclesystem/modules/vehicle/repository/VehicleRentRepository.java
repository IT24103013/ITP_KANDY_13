package com.samarasinghemotors.vehiclesystem.modules.vehicle.repository;

import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRentRepository extends JpaRepository<VehicleRent, Integer> {
    @Query("SELECT DISTINCT v FROM VehicleRent v LEFT JOIN FETCH v.images")
    List<VehicleRent> findAllWithImages();

    @Query("SELECT v FROM VehicleRent v LEFT JOIN FETCH v.images WHERE v.vehicleRentId = :id")
    Optional<VehicleRent> findByIdWithImages(Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM VehicleRent v WHERE v.vehicleRentId = :id")
    Optional<VehicleRent> findByIdWithLock(Integer id);
}
