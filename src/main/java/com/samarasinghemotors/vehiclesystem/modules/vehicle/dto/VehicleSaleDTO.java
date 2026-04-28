package com.samarasinghemotors.vehiclesystem.modules.vehicle.dto;

import java.math.BigDecimal;

public class VehicleSaleDTO {
    private Integer id;
    private String name;
    private String brand;
    private String model;
    private Integer yom;
    private String vehicleCondition;
    private String transmission;
    private Integer mileage;
    private BigDecimal price;
    private String description;
    private String imageUrl;
    private String scanReportUrl;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public Integer getYom() { return yom; }
    public void setYom(Integer yom) { this.yom = yom; }

    public String getVehicleCondition() { return vehicleCondition; }
    public void setVehicleCondition(String vehicleCondition) { this.vehicleCondition = vehicleCondition; }

    public String getTransmission() { return transmission; }
    public void setTransmission(String transmission) { this.transmission = transmission; }

    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getScanReportUrl() { return scanReportUrl; }
    public void setScanReportUrl(String scanReportUrl) { this.scanReportUrl = scanReportUrl; }
}
