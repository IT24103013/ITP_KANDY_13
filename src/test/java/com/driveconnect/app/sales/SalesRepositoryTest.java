package com.driveconnect.app.sales;

import com.driveconnect.app.sales.dto.VehicleSaleDTO;
import com.driveconnect.app.sales.repository.SalesRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class SalesRepositoryTest {

    @Autowired
    private SalesRepository salesRepository;

    @Test
    void testSearchVehiclesByBrand() {
        // Test case: Search for 'Honda'
        List<VehicleSaleDTO> results = salesRepository.searchVehicles(
                "Honda", null, null, null, null, null, null, null
        );

        // Verification: Ensure the list is not empty and contains Hondas
        assertNotNull(results);
        assertTrue(results.size() > 0, "Should return at least one Honda vehicle");
        assertEquals("Honda", results.get(0).getBrand());
    }

    @Test
    void testSearchByPriceRange() {
        // Test case: Max price of 10,000,000
        List<VehicleSaleDTO> results = salesRepository.searchVehicles(
                null, null, null, null, 10000000.0, null, null, null
        );

        // Verification: Ensure all returned cars are under 10M
        for (VehicleSaleDTO v : results) {
            assertTrue(v.getPrice().doubleValue() <= 10000000.0);
        }
    }
}