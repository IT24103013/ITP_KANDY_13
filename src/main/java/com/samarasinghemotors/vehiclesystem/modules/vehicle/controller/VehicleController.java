package com.samarasinghemotors.vehiclesystem.modules.vehicle.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.dto.VehicleSaleDTO;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    // --- RENT VEHICLES ENDPOINTS --- //

    @GetMapping("/rent")
    public ResponseEntity<List<VehicleRent>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehiclesForRent());
    }

    @GetMapping("/rent/{id}")
    public ResponseEntity<VehicleRent> getVehicleRentById(@PathVariable Integer id) {
        return ResponseEntity.ok(vehicleService.getVehicleRentById(id));
    }

    @PostMapping("/rent")
    public ResponseEntity<?> createRentVehicle(
            @RequestParam("vehicleData") String vehicleDataJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            VehicleRent vehicleRent = objectMapper.readValue(vehicleDataJson, VehicleRent.class);
            VehicleRent created = vehicleService.createRentVehicle(vehicleRent, imageFile);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error creating vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/rent/{id}")
    public ResponseEntity<?> updateRentVehicle(
            @PathVariable Integer id,
            @RequestParam("vehicleData") String vehicleDataJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            VehicleRent updatedDetails = objectMapper.readValue(vehicleDataJson, VehicleRent.class);
            VehicleRent updated = vehicleService.updateRentVehicle(id, updatedDetails, imageFile);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/rent/{id}")
    public ResponseEntity<?> deleteRentVehicle(@PathVariable Integer id) {
        try {
            vehicleService.deleteRentVehicle(id);
            return ResponseEntity.ok("Vehicle deleted successfully.");
        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // --- SALE VEHICLES ENDPOINTS --- //

    @GetMapping("/sale")
    public ResponseEntity<List<VehicleSale>> getAllVehiclesForSale() {
        return ResponseEntity.ok(vehicleService.getAllVehiclesForSale());
    }

    @GetMapping("/sale/{id}")
    public ResponseEntity<VehicleSale> getVehicleSaleById(@PathVariable Integer id) {
        return ResponseEntity.ok(vehicleService.getVehicleSaleById(id));
    }

    @PostMapping("/sale")
    public ResponseEntity<?> createSaleVehicle(
            @RequestParam("vehicleData") String vehicleDataJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            VehicleSale vehicleSale = objectMapper.readValue(vehicleDataJson, VehicleSale.class);
            VehicleSale created = vehicleService.createSaleVehicle(vehicleSale, imageFile);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>("Error creating vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/sale/{id}")
    public ResponseEntity<?> updateSaleVehicle(
            @PathVariable Integer id,
            @RequestParam("vehicleData") String vehicleDataJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            VehicleSale updatedDetails = objectMapper.readValue(vehicleDataJson, VehicleSale.class);
            VehicleSale updated = vehicleService.updateSaleVehicle(id, updatedDetails, imageFile);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/sale/{id}")
    public ResponseEntity<?> deleteSaleVehicle(@PathVariable Integer id) {
        try {
            vehicleService.deleteSaleVehicle(id);
            return ResponseEntity.ok("Vehicle deleted successfully.");
        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting vehicle: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // Public Customer Endpoints for Browse and Search
    @GetMapping("/public/sale")
    public ResponseEntity<List<VehicleSaleDTO>> getPublicAvailableVehicles() {
        return ResponseEntity.ok(vehicleService.getAllAvailableVehiclesDTO());
    }

    @GetMapping("/public/sale/search")
    public ResponseEntity<List<VehicleSaleDTO>> searchPublicVehicles(
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String condition,
            @RequestParam(required = false) String transmission,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer yearReg,
            @RequestParam(required = false) String bodyType,
            @RequestParam(required = false) Integer mileage) {

        List<VehicleSaleDTO> results = vehicleService.searchAvailableVehiclesDTO(brand, model, condition, transmission, maxPrice, yearReg, bodyType, mileage);
        return ResponseEntity.ok(results);
    }
    
    @GetMapping("/public/sale/{id}")
    public ResponseEntity<VehicleSaleDTO> getPublicVehicleById(@PathVariable Integer id) {
        VehicleSaleDTO vehicle = vehicleService.getVehicleSaleDTOById(id);
        if (vehicle != null) {
            return ResponseEntity.ok(vehicle);
        }
        return ResponseEntity.notFound().build();
    }
    // Public Customer Endpoints for Rental Browse and Search
    @GetMapping("/public/rent")
    public ResponseEntity<List<VehicleRent>> getPublicAvailableRentVehicles() {
        return ResponseEntity.ok(vehicleService.getAllAvailableRentVehicles());
    }

    @GetMapping("/public/rent/search")
    public ResponseEntity<List<VehicleRent>> searchPublicRentVehicles(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String gearType,
            @RequestParam(required = false) String fuelType,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer seats) {

        List<VehicleRent> results = vehicleService.searchAvailableRentVehicles(name, type, gearType, fuelType, maxPrice, seats);
        return ResponseEntity.ok(results);
    }
}
