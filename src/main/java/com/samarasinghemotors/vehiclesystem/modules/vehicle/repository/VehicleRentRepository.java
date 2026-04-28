package com.samarasinghemotors.vehiclesystem.modules.vehicle.repository;

import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRentRepository extends JpaRepository<VehicleRent, Integer> {
    @Query("SELECT DISTINCT v FROM VehicleRent v LEFT JOIN FETCH v.images")
    List<VehicleRent> findAllWithImages();

    @Query("SELECT v FROM VehicleRent v LEFT JOIN FETCH v.images WHERE v.vehicleRentId = :id")
    Optional<VehicleRent> findByIdWithImages(@Param("id") Integer id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM VehicleRent v WHERE v.vehicleRentId = :id")
    Optional<VehicleRent> findByIdWithLock(@Param("id") Integer id);

    @Query("SELECT DISTINCT v FROM VehicleRent v LEFT JOIN FETCH v.images WHERE v.status = 'Available'")
    List<VehicleRent> findAllAvailableWithImages();

    @Query("SELECT DISTINCT v FROM VehicleRent v LEFT JOIN FETCH v.images WHERE v.status = 'Available' " +
           "AND (:name IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :name, '%'))) " +
           "AND (:type IS NULL OR LOWER(v.type) = LOWER(:type)) " +
           "AND (:gearType IS NULL OR :gearType = 'Any' OR LOWER(v.gearType) = LOWER(:gearType)) " +
           "AND (:fuelType IS NULL OR :fuelType = 'Any' OR LOWER(v.fuelType) = LOWER(:fuelType)) " +
           "AND (:maxPrice IS NULL OR v.dailyRate <= :maxPrice) " +
           "AND (:seats IS NULL OR v.seats = :seats)")
    List<VehicleRent> searchAvailableVehicles(@Param("name") String name,
                                             @Param("type") String type,
                                             @Param("gearType") String gearType,
                                             @Param("fuelType") String fuelType,
                                             @Param("maxPrice") java.math.BigDecimal maxPrice,
                                             @Param("seats") Integer seats);
}
