package com.driveconnect.app.sales.dto;

public class TrendingVehicleDTO {
    private Long vehicleId;
    private String brand;
    private String name;
    private Integer totalInquiries;

    // Getters and Setters
    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getTotalInquiries() { return totalInquiries; }
    public void setTotalInquiries(Integer totalInquiries) { this.totalInquiries = totalInquiries; }
}