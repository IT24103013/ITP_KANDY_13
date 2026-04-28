package com.samarasinghemotors.vehiclesystem.modules.vehicle.repository;

import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleSaleRepository extends JpaRepository<VehicleSale, Integer> {

    @Query("SELECT DISTINCT v FROM VehicleSale v LEFT JOIN FETCH v.images")
    List<VehicleSale> findAllWithImages();

    @Query("SELECT v FROM VehicleSale v LEFT JOIN FETCH v.images WHERE v.vehicleSaleId = :id")
    Optional<VehicleSale> findByIdWithImages(@Param("id") Integer id);

    @Query("SELECT DISTINCT v FROM VehicleSale v LEFT JOIN FETCH v.images WHERE v.status = 'Available'")
    List<VehicleSale> findAllAvailableWithImages();

    @Query("SELECT DISTINCT v FROM VehicleSale v LEFT JOIN FETCH v.images WHERE v.status = 'Available' " +
           "AND (:brand IS NULL OR LOWER(TRIM(v.brand)) = LOWER(TRIM(:brand))) " +
           "AND (:model IS NULL OR LOWER(TRIM(v.name)) = LOWER(TRIM(:model)) OR LOWER(TRIM(v.edition)) = LOWER(TRIM(:model))) " +
           "AND (:condition IS NULL OR :condition = 'All Conditions' OR LOWER(TRIM(v.conditionStatus)) = LOWER(TRIM(:condition))) " +
           "AND (:transmission IS NULL OR :transmission = 'Any' OR LOWER(TRIM(v.transmission)) = LOWER(TRIM(:transmission))) " +
           "AND (:maxPrice IS NULL OR v.price <= :maxPrice) " +
           "AND (:yearReg IS NULL OR v.yearReg = :yearReg) " +
           "AND (:bodyType IS NULL OR LOWER(TRIM(v.bodyType)) = LOWER(TRIM(:bodyType))) " +
           "AND (:mileage IS NULL OR v.mileage <= :mileage)")
    List<VehicleSale> searchAvailableVehicles(@Param("brand") String brand,
                                            @Param("model") String model,
                                            @Param("condition") String condition,
                                            @Param("transmission") String transmission,
                                            @Param("maxPrice") java.math.BigDecimal maxPrice,
                                            @Param("yearReg") Integer yearReg,
                                            @Param("bodyType") String bodyType,
                                            @Param("mileage") Integer mileage);
}
