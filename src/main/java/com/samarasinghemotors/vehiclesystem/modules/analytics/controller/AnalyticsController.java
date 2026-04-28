package com.samarasinghemotors.vehiclesystem.modules.analytics.controller;

import com.samarasinghemotors.vehiclesystem.modules.analytics.dto.AdminAnalyticsSummaryDTO;
import com.samarasinghemotors.vehiclesystem.modules.analytics.service.AnalyticsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    @GetMapping("/summary")
    public ResponseEntity<AdminAnalyticsSummaryDTO> getSummary() {
        return ResponseEntity.ok(analyticsService.getAdminSummary());
    }

    @GetMapping("/reviews")
    public ResponseEntity<?> getReviewSummary() {
        return ResponseEntity.ok(analyticsService.getReviewSummary());
    }

    @GetMapping("/finance")
    public ResponseEntity<?> getFinanceSummary() {
        return ResponseEntity.ok(analyticsService.getFinanceSummary());
    }
}
