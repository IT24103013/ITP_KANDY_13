package com.samarasinghemotors.vehiclesystem.modules.vehicle.service;

import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleImage;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleImageRepository;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.dto.VehicleSaleDTO;

@Service
public class VehicleService {

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    @Autowired
    private com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleSaleRepository vehicleSaleRepository;

    @Autowired
    private VehicleImageRepository vehicleImageRepository;

    // Define the directory based on user requirements
    private static final String IMAGE_UPLOAD_DIR = "/home/d3e1c4/Music/Version/ITP_KANDY_13/frontend/public/images/";

    public List<VehicleRent> getAllVehiclesForRent() {
        return vehicleRentRepository.findAllWithImages();
    }

    public List<com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale> getAllVehiclesForSale() {
        return vehicleSaleRepository.findAllWithImages();
    }

    public List<VehicleSaleDTO> getAllAvailableVehiclesDTO() {
        List<com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale> vehicles = vehicleSaleRepository.findAllAvailableWithImages();
        return vehicles.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<VehicleSaleDTO> searchAvailableVehiclesDTO(String brand, String model, String condition,
                                                         String transmission, Double maxPrice, Integer yearReg,
                                                         String bodyType, Integer mileage) {
        java.math.BigDecimal maxBigDecimal = maxPrice != null ? java.math.BigDecimal.valueOf(maxPrice) : null;
        List<com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale> vehicles =
            vehicleSaleRepository.searchAvailableVehicles(brand, model, condition, transmission, maxBigDecimal, yearReg, bodyType, mileage);
        return vehicles.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<VehicleRent> getAllAvailableRentVehicles() {
        return vehicleRentRepository.findAllAvailableWithImages();
    }

    public List<VehicleRent> searchAvailableRentVehicles(String name, String type, String gearType,
                                                       String fuelType, Double maxPrice, Integer seats) {
        java.math.BigDecimal maxBigDecimal = maxPrice != null ? java.math.BigDecimal.valueOf(maxPrice) : null;
        return vehicleRentRepository.searchAvailableVehicles(name, type, gearType, fuelType, maxBigDecimal, seats);
    }

    public VehicleSaleDTO getVehicleSaleDTOById(Integer id) {
        com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale v = vehicleSaleRepository.findByIdWithImages(id)
                .orElse(null);
        return v != null ? mapToDTO(v) : null;
    }

    private VehicleSaleDTO mapToDTO(com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale vehicle) {
        VehicleSaleDTO dto = new VehicleSaleDTO();
        dto.setId(vehicle.getVehicleSaleId());
        dto.setName(vehicle.getName());
        dto.setBrand(vehicle.getBrand());
        dto.setModel(vehicle.getEdition());
        if (vehicle.getYom() != null) {
            // Java YEAR type maps differently, assuming Integer/Short conversion possible
            dto.setYom(Integer.valueOf(vehicle.getYom().toString()));
        }
        dto.setVehicleCondition(vehicle.getConditionStatus());
        dto.setTransmission(vehicle.getTransmission());
        dto.setMileage(vehicle.getMileage());
        dto.setPrice(vehicle.getPrice());
        dto.setDescription(vehicle.getDescription());
        dto.setScanReportUrl(vehicle.getScanReportUrl());
        
        if (vehicle.getImages() != null && !vehicle.getImages().isEmpty()) {
            dto.setImageUrl(vehicle.getImages().get(0).getImgUrl());
        }
        
        return dto;
    }

    public VehicleRent getVehicleRentById(Integer id) {
        return vehicleRentRepository.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Vehicle for Rent not found with ID: " + id));
    }

    public com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale getVehicleSaleById(Integer id) {
        return vehicleSaleRepository.findByIdWithImages(id)
                .orElseThrow(() -> new RuntimeException("Vehicle for Sale not found with ID: " + id));
    }

    @Transactional
    public com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale createSaleVehicle(com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale vehicleSale, MultipartFile imageFile) throws IOException {
        com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale savedVehicle = vehicleSaleRepository.save(vehicleSale);

        if (imageFile != null && !imageFile.isEmpty()) {
            File dir = new File(IMAGE_UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String filename = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename().replaceAll("\\s+", "_");
            Path filepath = Paths.get(IMAGE_UPLOAD_DIR, filename);
            Files.write(filepath, imageFile.getBytes());

            VehicleImage img = new VehicleImage();
            img.setImgUrl("/images/" + filename);
            img.setVehicleSale(savedVehicle);
            vehicleImageRepository.save(img);
        }

        return savedVehicle;
    }

    @Transactional
    public com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale updateSaleVehicle(Integer id, com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale updatedDetails, MultipartFile imageFile) throws IOException {
        com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale existing = vehicleSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));

        existing.setName(updatedDetails.getName());
        existing.setConditionStatus(updatedDetails.getConditionStatus());
        existing.setYearReg(updatedDetails.getYearReg());
        existing.setYom(updatedDetails.getYom());
        existing.setEdition(updatedDetails.getEdition());
        existing.setScanReportUrl(updatedDetails.getScanReportUrl());
        existing.setStatus(updatedDetails.getStatus());
        existing.setBrand(updatedDetails.getBrand());
        existing.setTransmission(updatedDetails.getTransmission());
        existing.setBodyType(updatedDetails.getBodyType());
        existing.setEngineCap(updatedDetails.getEngineCap());
        existing.setMileage(updatedDetails.getMileage());
        existing.setColor(updatedDetails.getColor());
        existing.setPrice(updatedDetails.getPrice());
        existing.setDescription(updatedDetails.getDescription());

        com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale savedVehicle = vehicleSaleRepository.save(existing);

        if (imageFile != null && !imageFile.isEmpty()) {
            if (existing.getImages() != null) {
                for (VehicleImage oldImg : existing.getImages()) {
                    deleteImageFile(oldImg.getImgUrl());
                }
                vehicleImageRepository.deleteAll(existing.getImages());
            }

            String filename = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename().replaceAll("\\s+", "_");
            Path filepath = Paths.get(IMAGE_UPLOAD_DIR, filename);
            Files.write(filepath, imageFile.getBytes());

            VehicleImage img = new VehicleImage();
            img.setImgUrl("/images/" + filename);
            img.setVehicleSale(savedVehicle);
            vehicleImageRepository.save(img);
        }

        return savedVehicle;
    }

    @Transactional
    public void deleteSaleVehicle(Integer id) {
        com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleSale existing = vehicleSaleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));

        if (existing.getImages() != null) {
            for (VehicleImage oldImg : existing.getImages()) {
                deleteImageFile(oldImg.getImgUrl());
            }
        }
        vehicleSaleRepository.deleteById(id);
    }

    @Transactional
    public VehicleRent createRentVehicle(VehicleRent vehicleRent, MultipartFile imageFile) throws IOException {
        // Save vehicle to generate ID
        VehicleRent savedVehicle = vehicleRentRepository.save(vehicleRent);

        // Handle Image Save
        if (imageFile != null && !imageFile.isEmpty()) {
            File dir = new File(IMAGE_UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String filename = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename().replaceAll("\\s+", "_");
            Path filepath = Paths.get(IMAGE_UPLOAD_DIR, filename);
            Files.write(filepath, imageFile.getBytes());

            VehicleImage img = new VehicleImage();
            img.setImgUrl("/images/" + filename);
            img.setVehicleRent(savedVehicle);
            vehicleImageRepository.save(img);
        }

        return savedVehicle;
    }

    @Transactional
    public VehicleRent updateRentVehicle(Integer id, VehicleRent updatedDetails, MultipartFile imageFile) throws IOException {
        VehicleRent existing = vehicleRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));

        existing.setName(updatedDetails.getName());
        existing.setType(updatedDetails.getType());
        existing.setYear(updatedDetails.getYear());
        existing.setDailyRate(updatedDetails.getDailyRate());
        existing.setStatus(updatedDetails.getStatus());
        existing.setDescription(updatedDetails.getDescription());
        existing.setMileageLimit(updatedDetails.getMileageLimit());
        existing.setExtraMileageCharge(updatedDetails.getExtraMileageCharge());
        existing.setAvgFuelEfficiency(updatedDetails.getAvgFuelEfficiency());
        existing.setGearType(updatedDetails.getGearType());
        existing.setSeats(updatedDetails.getSeats());
        existing.setFuelType(updatedDetails.getFuelType());

        VehicleRent savedVehicle = vehicleRentRepository.save(existing);

        if (imageFile != null && !imageFile.isEmpty()) {
            // Delete old images from file system and database
            if (existing.getImages() != null) {
                for (VehicleImage oldImg : existing.getImages()) {
                    deleteImageFile(oldImg.getImgUrl());
                }
                vehicleImageRepository.deleteAll(existing.getImages());
            }
            
            String filename = System.currentTimeMillis() + "_" + imageFile.getOriginalFilename().replaceAll("\\s+", "_");
            Path filepath = Paths.get(IMAGE_UPLOAD_DIR, filename);
            Files.write(filepath, imageFile.getBytes());

            VehicleImage img = new VehicleImage();
            img.setImgUrl("/images/" + filename);
            img.setVehicleRent(savedVehicle);
            vehicleImageRepository.save(img);
        }

        return savedVehicle;
    }

    @Transactional
    public void deleteRentVehicle(Integer id) {
        VehicleRent existing = vehicleRentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with ID: " + id));
        
        if (existing.getImages() != null) {
            for (VehicleImage oldImg : existing.getImages()) {
                deleteImageFile(oldImg.getImgUrl());
            }
        }
        vehicleRentRepository.deleteById(id);
    }

    private void deleteImageFile(String imgUrl) {
        if (imgUrl != null && imgUrl.startsWith("/images/")) {
            String filename = imgUrl.substring(8);
            Path filepath = Paths.get(IMAGE_UPLOAD_DIR, filename);
            try {
                Files.deleteIfExists(filepath);
            } catch (IOException e) {
                System.err.println("Failed to delete image file: " + filepath);
            }
        }
    }
}
