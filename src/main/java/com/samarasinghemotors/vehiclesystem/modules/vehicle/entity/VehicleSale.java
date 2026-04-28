package com.samarasinghemotors.vehiclesystem.modules.vehicle.entity;

import com.samarasinghemotors.vehiclesystem.modules.promotion.entity.Promotion;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Admin;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicle_sale")
@Getter
@Setter
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VehicleSale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_sale_id")
    private Integer vehicleSaleId;

    @Column(nullable = false)
    private String name;

    @Column(name = "condition_status")
    private String conditionStatus;
    
    @Column(name = "year_reg", columnDefinition = "YEAR")
    private Integer yearReg;
    
    @Column(name = "yom", columnDefinition = "YEAR")
    private Integer yom;
    
    private String edition;
    
    @Column(name = "scan_report_url")
    private String scanReportUrl;
    
    private String status; // Available, Sold, Reserved
    private String brand;
    private String transmission;
    @Column(name = "body_type")
    private String bodyType;

    @Column(name = "engine_cap")
    private String engineCap;
    private Integer mileage;
    private String color;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "promo_id")
    private Promotion promotion;

    @OneToMany(mappedBy = "vehicleSale", cascade = CascadeType.ALL)
    private java.util.List<VehicleImage> images;
}
