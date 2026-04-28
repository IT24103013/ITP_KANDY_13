package com.samarasinghemotors.vehiclesystem.modules.review.repository;

import com.samarasinghemotors.vehiclesystem.modules.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByVehicleRent_VehicleRentIdOrderByReviewDateDesc(Integer vehicleRentId);
    List<Review> findByVehicleSale_VehicleSaleIdOrderByReviewDateDesc(Integer vehicleSaleId);
}
