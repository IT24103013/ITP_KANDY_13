package com.samarasinghemotors.vehiclesystem.modules.review.service;

import com.samarasinghemotors.vehiclesystem.modules.review.entity.Review;
import com.samarasinghemotors.vehiclesystem.modules.review.repository.ReviewRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.Customer;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.CustomerRepository;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.entity.VehicleRent;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleRentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private VehicleRentRepository vehicleRentRepository;

    public List<Review> getReviewsForVehicleRent(Integer vehicleRentId) {
        return reviewRepository.findByVehicleRent_VehicleRentIdOrderByReviewDateDesc(vehicleRentId);
    }

    public Review createReview(Integer customerUserId, Integer vehicleRentId, Integer stars, String comment) {
        Customer customer = customerRepository.findById(customerUserId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        
        VehicleRent rentVehicle = vehicleRentRepository.findById(vehicleRentId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        Review review = new Review();
        review.setCustomer(customer);
        review.setVehicleRent(rentVehicle);
        review.setStars(stars);
        review.setComment(comment);

        return reviewRepository.save(review);
    }

    public Review updateReview(Integer reviewId, Integer customerUserId, Integer stars, String comment) {
        Review existing = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!existing.getCustomer().getUserId().equals(customerUserId)) {
            throw new RuntimeException("Unauthorized: You can only edit your own reviews.");
        }

        existing.setStars(stars);
        existing.setComment(comment);
        return reviewRepository.save(existing);
    }

    public void deleteReview(Integer reviewId, Integer customerUserId) {
        Review existing = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!existing.getCustomer().getUserId().equals(customerUserId)) {
            throw new RuntimeException("Unauthorized: You can only delete your own reviews.");
        }

        reviewRepository.delete(existing);
    }
}
