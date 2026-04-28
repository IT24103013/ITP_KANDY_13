package com.samarasinghemotors.vehiclesystem.modules.vehicle.entity;

import com.samarasinghemotors.vehiclesystem.modules.promotion.entity.Promotion;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Admin;
// import com.samarasinghemotors.vehiclesystem.modules.promotion.entity.Promotion;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicle_rent")
@Getter
@Setter
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VehicleRent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_rent_id")
    private Integer vehicleRentId;

    private String name;
    private String type;
    @Column(name = "year", columnDefinition = "YEAR")
    private Integer year;

    @Column(name = "daily_rate", nullable = false)
    private BigDecimal dailyRate;

    private String status; // Available, Reserved, Rented

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "mileage_limit")
    private Integer mileageLimit;

    @Column(name = "extra_mileage_charge")
    private BigDecimal extraMileageCharge;

    @Column(name = "avg_fuel_efficiency")
    private String avgFuelEfficiency;

    @Column(name = "gear_type")
    private String gearType;

    private Integer seats;

    @Column(name = "fuel_type")
    private String fuelType;

    // Relationships

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_id")
    private Promotion promotion;

    @OneToMany(mappedBy = "vehicleRent", cascade = CascadeType.ALL)
    private java.util.List<VehicleImage> images;
}