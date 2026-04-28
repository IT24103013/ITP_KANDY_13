package com.samarasinghemotors.vehiclesystem.modules.analytics.service;

import com.samarasinghemotors.vehiclesystem.modules.analytics.dto.AdminAnalyticsSummaryDTO;
import com.samarasinghemotors.vehiclesystem.modules.review.entity.Review;
import com.samarasinghemotors.vehiclesystem.modules.review.repository.ReviewRepository;
import com.samarasinghemotors.vehiclesystem.modules.booking.repository.BookingRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.repository.PaymentRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.UserRepository;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    public AdminAnalyticsSummaryDTO getAdminSummary() {
        AdminAnalyticsSummaryDTO dto = new AdminAnalyticsSummaryDTO();

        // Total Revenue
        BigDecimal revenue = paymentRepository.getTotalRevenue();
        dto.setTotalRevenue(revenue != null ? revenue : BigDecimal.ZERO);

        // Counts
        dto.setTotalBookings(bookingRepository.count());
        dto.setTotalUsers(userRepository.count());
        dto.setTotalVehicles(vehicleRentRepository.count());

        // Distributions
        dto.setBookingsByStatus(
            bookingRepository.findAll().stream()
                .collect(Collectors.groupingBy(b -> b.getBookingStatus(), Collectors.counting()))
        );

        dto.setVehiclesByType(
            vehicleRentRepository.findAll().stream()
                .collect(Collectors.groupingBy(v -> v.getType(), Collectors.counting()))
        );

        dto.setUsersByRole(
            userRepository.findAll().stream()
                .collect(Collectors.groupingBy(u -> u.getRole(), Collectors.counting()))
        );

        return dto;
    }

    public Map<String, Object> getReviewSummary() {
        List<Review> reviews = reviewRepository.findAll();
        
        double overallAvg = reviews.stream()
                .mapToInt(Review::getStars)
                .average()
                .orElse(0.0);

        Map<Integer, List<Review>> reviewsByVehicle = reviews.stream()
                .filter(r -> r.getVehicleRent() != null)
                .collect(Collectors.groupingBy(r -> r.getVehicleRent().getVehicleRentId()));

        List<Map<String, Object>> vehicleRatings = new ArrayList<>();
        
        reviewsByVehicle.forEach((vId, vReviews) -> {
            double avg = vReviews.stream().mapToInt(Review::getStars).average().orElse(0.0);
            Map<String, Object> map = new HashMap<>();
            map.put("vehicleId", vId);
            map.put("name", vReviews.get(0).getVehicleRent().getName());
            map.put("avgRating", avg);
            map.put("reviewCount", vReviews.size());
            vehicleRatings.add(map);
        });

        // Sort by rating
        vehicleRatings.sort((a, b) -> Double.compare((double)b.get("avgRating"), (double)a.get("avgRating")));

        List<Map<String, Object>> top5 = vehicleRatings.stream().limit(5).collect(Collectors.toList());
        
        List<Map<String, Object>> bottom5 = new ArrayList<>(vehicleRatings);
        Collections.reverse(bottom5);
        bottom5 = bottom5.stream().limit(5).collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("overallAverage", overallAvg);
        result.put("totalReviews", reviews.size());
        result.put("topPerformers", top5);
        result.put("bottomPerformers", bottom5);
        
        return result;
    }

    public Map<String, Object> getFinanceSummary() {
        List<com.samarasinghemotors.vehiclesystem.modules.payment.entity.Payment> payments = paymentRepository.findAll();
        
        BigDecimal totalRevenue = paymentRepository.getTotalRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;

        Map<String, Long> statusCount = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getStatus(), Collectors.counting()));

        Map<String, BigDecimal> statusRevenue = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getStatus(), 
                        Collectors.reducing(BigDecimal.ZERO, 
                                            p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO, 
                                            BigDecimal::add)));

        // Monthly Revenue (Group by YYYY-MM)
        Map<String, BigDecimal> monthlyRevenue = payments.stream()
                .filter(p -> "APPROVED".equals(p.getStatus()) && p.getPaymentDate() != null)
                .collect(Collectors.groupingBy(p -> p.getPaymentDate().toString().substring(0, 7), 
                        Collectors.reducing(BigDecimal.ZERO, 
                                            p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO, 
                                            BigDecimal::add)));

        Map<String, Object> result = new HashMap<>();
        result.put("totalGrossRevenue", totalRevenue);
        result.put("statusCount", statusCount);
        result.put("statusRevenue", statusRevenue);
        result.put("monthlyRevenue", monthlyRevenue);
        result.put("allPayments", payments);
        
        return result;
    }
}
