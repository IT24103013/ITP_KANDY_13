package com.samarasinghemotors.vehiclesystem.modules.vehicle.repository;

import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VehicleImageRepository extends JpaRepository<VehicleImage, Integer> {
    List<VehicleImage> findByVehicleRent_VehicleRentId(Integer vehicleRentId);
    List<VehicleImage> findByVehicleSale_VehicleSaleId(Integer vehicleSaleId);
}
