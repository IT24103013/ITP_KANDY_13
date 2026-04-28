package com.samarasinghemotors.vehiclesystem.modules.review.controller;

import com.samarasinghemotors.vehiclesystem.modules.review.entity.Review;
import com.samarasinghemotors.vehiclesystem.modules.review.service.ReviewService;
import com.samarasinghemotors.vehiclesystem.modules.user.entity.User;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    public record ReviewRequest(Integer vehicleRentId, Integer rating, String comment) {}
    public record ReviewUpdateReq(Integer rating, String comment) {}
    
    public record ReviewResponse(Integer id, Integer customerId, String customerName, Integer vehicleRentId, Integer rating, String comment) {}

    private ReviewResponse mapToResponse(Review r) {
        return new ReviewResponse(
            r.getReviewId(), 
            r.getCustomer() != null ? r.getCustomer().getUserId() : null, 
            r.getCustomer() != null ? r.getCustomer().getFullName() : "Anonymous",
            r.getVehicleRent() != null ? r.getVehicleRent().getVehicleRentId() : null, 
            r.getStars(), 
            r.getComment()
        );
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsByVehicle(@PathVariable("vehicleId") Integer vehicleId) {
        List<Review> reviews = reviewService.getReviewsForVehicleRent(vehicleId);
        List<ReviewResponse> responses = reviews.stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> submitReview(@RequestBody ReviewRequest req, Principal principal) {
        if (principal == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        
        Review saved = reviewService.createReview(user.getUserId(), req.vehicleRentId(), req.rating(), req.comment());
        return new ResponseEntity<>(mapToResponse(saved), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> updateReview(@PathVariable("id") Integer id, @RequestBody ReviewUpdateReq req, Principal principal) {
        if (principal == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

        Review updated = reviewService.updateReview(id, user.getUserId(), req.rating(), req.comment());
        return ResponseEntity.ok(mapToResponse(updated));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<Void> deleteReview(@PathVariable("id") Integer id, Principal principal) {
        if (principal == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        
        User user = userRepository.findByEmail(principal.getName()).orElse(null);
        if (user == null) return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);

        reviewService.deleteReview(id, user.getUserId());
        return ResponseEntity.noContent().build();
    }
}
