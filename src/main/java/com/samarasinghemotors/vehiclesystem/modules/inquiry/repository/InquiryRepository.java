package com.samarasinghemotors.vehiclesystem.modules.inquiry.repository;

import com.samarasinghemotors.vehiclesystem.modules.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Integer> {
    List<Inquiry> findByCustomer_UserId(Integer customerId);
    List<Inquiry> findByStatus(String status);

    @Query("SELECT i FROM Inquiry i JOIN FETCH i.customer c JOIN FETCH i.vehicleSale v ORDER BY i.inquiryId DESC")
    List<Inquiry> findAllWithDetails();

    @Modifying
    @Query("UPDATE Inquiry i SET i.status = :status, i.adminReply = :reply WHERE i.inquiryId = :inquiryId")
    void updateStatusAndReply(@Param("inquiryId") Integer inquiryId, @Param("status") String status, @Param("reply") String reply);

    @Modifying
    @Query("UPDATE Inquiry i SET i.status = 'REJECTED', i.adminReply = :reply WHERE i.vehicleSale.vehicleSaleId = :vehicleId AND i.inquiryId != :acceptedId")
    void rejectOtherInquiries(@Param("vehicleId") Integer vehicleId, @Param("acceptedId") Integer acceptedId, @Param("reply") String reply);

    @Query("SELECT i FROM Inquiry i JOIN FETCH i.customer c JOIN FETCH i.vehicleSale v WHERE v.vehicleSaleId = :vehicleId AND i.inquiryId != :acceptedId")
    List<Inquiry> findOtherInquiries(@Param("vehicleId") Integer vehicleId, @Param("acceptedId") Integer acceptedId);

    @Query("SELECT v.vehicleSaleId, v.brand, v.name, COUNT(i.inquiryId) as total_inquiries " +
           "FROM Inquiry i JOIN i.vehicleSale v " +
           "GROUP BY v.vehicleSaleId, v.brand, v.name " +
           "ORDER BY total_inquiries DESC")
    List<Object[]> getTrendingVehiclesReportRaw();
}
