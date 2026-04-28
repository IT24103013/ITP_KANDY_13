package com.samarasinghemotors.vehiclesystem.modules.estimator.controller;

import com.samarasinghemotors.vehiclesystem.modules.estimator.dto.EstimatorRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.estimator.dto.EstimatorResponseDTO;
import com.samarasinghemotors.vehiclesystem.modules.estimator.service.EstimatorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estimator")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class EstimatorController {

    @Autowired
    private EstimatorService estimatorService;

    @PostMapping("/calculate")
    public ResponseEntity<EstimatorResponseDTO> calculateCost(@RequestBody EstimatorRequestDTO request) {
        EstimatorResponseDTO response = estimatorService.calculateTotalCost(request);
        return ResponseEntity.ok(response);
    }
}
