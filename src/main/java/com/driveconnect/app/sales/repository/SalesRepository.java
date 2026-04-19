package com.driveconnect.app.sales.repository;

import com.driveconnect.app.sales.dto.InquiryDetailDTO;
import com.driveconnect.app.sales.dto.VehicleSaleDTO;
import com.driveconnect.app.sales.dto.TrendingVehicleDTO;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class SalesRepository {

    private final JdbcTemplate jdbcTemplate;

    public SalesRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }


    private final RowMapper<VehicleSaleDTO> vehicleRowMapper = new RowMapper<VehicleSaleDTO>() {
        @Override
        public VehicleSaleDTO mapRow(ResultSet rs, int rowNum) throws SQLException {
            VehicleSaleDTO dto = new VehicleSaleDTO();
            dto.setId(rs.getInt("vehicle_sale_id"));
            dto.setName(rs.getString("name"));
            dto.setBrand(rs.getString("brand"));
            dto.setModel(rs.getString("edition"));
            dto.setYom(rs.getInt("yom"));
            dto.setVehicleCondition(rs.getString("condition_status"));
            dto.setTransmission(rs.getString("transmission"));
            dto.setMileage(rs.getInt("mileage"));
            dto.setPrice(rs.getBigDecimal("price"));
            dto.setDescription(rs.getString("description"));
            dto.setImageUrl(rs.getString("primary_img"));
            dto.setScanReportUrl(rs.getString("scan_report_url"));
            return dto;
        }
    };

    //  vehicles for browse
    public List<VehicleSaleDTO> getAllAvailableVehicles() {
        String sql = "SELECT vs.*, " +
                "(SELECT img_url FROM vehicle_images vi WHERE vi.vehicle_sale_id = vs.vehicle_sale_id LIMIT 1) as primary_img " +
                "FROM vehicle_sale vs WHERE vs.status = 'Available'";
        return jdbcTemplate.query(sql, vehicleRowMapper);
    }

    // single  car details in vehicle info page
    public VehicleSaleDTO getVehicleById(int id) {
        String sql = "SELECT vs.*, " +
                "(SELECT img_url FROM vehicle_images vi WHERE vi.vehicle_sale_id = vs.vehicle_sale_id LIMIT 1) as primary_img " +
                "FROM vehicle_sale vs WHERE vs.vehicle_sale_id = ?";
        List<VehicleSaleDTO> results = jdbcTemplate.query(sql, vehicleRowMapper, id);
        return results.isEmpty() ? null : results.get(0);
    }

    // save inquiry
    public void saveInquiry(Long customerId, Long vehicleSaleId, String inquiryType, String message) {
        String sql = "INSERT INTO inquiries (customer_id, vehicle_sale_id, inquiry_type, message, status) VALUES (?, ?, ?, ?, 'Unread')";
        jdbcTemplate.update(sql, customerId, vehicleSaleId, inquiryType, message);
    }

    public List<VehicleSaleDTO> searchVehicles(String brand, String model, String condition, String transmission, Double maxPrice, Integer yearReg, String bodyType, Integer mileage) {
        StringBuilder sql = new StringBuilder(
                "SELECT vs.*, (SELECT img_url FROM vehicle_images vi WHERE vi.vehicle_sale_id = vs.vehicle_sale_id LIMIT 1) as primary_img " +
                        "FROM vehicle_sale vs WHERE vs.status = 'Available'"
        );

        List<Object> params = new ArrayList<>();


        if (brand != null && !brand.isEmpty()) {
            sql.append(" AND LOWER(TRIM(vs.brand)) = LOWER(TRIM(?))");
            params.add(brand);
        }
        if (model != null && !model.isEmpty()) {
            sql.append(" AND (LOWER(TRIM(vs.name)) = LOWER(TRIM(?)) OR LOWER(TRIM(vs.edition)) = LOWER(TRIM(?)))");
            params.add(model); params.add(model);
        }
        if (condition != null && !condition.isEmpty() && !condition.equals("All Conditions")) {
            sql.append(" AND LOWER(TRIM(vs.condition_status)) = LOWER(TRIM(?))");
            params.add(condition);
        }
        if (transmission != null && !transmission.isEmpty() && !transmission.equals("Any")) {
            sql.append(" AND LOWER(TRIM(vs.transmission)) = LOWER(TRIM(?))");
            params.add(transmission);
        }
        if (maxPrice != null && maxPrice > 0) {
            sql.append(" AND vs.price <= ?");
            params.add(maxPrice);
        }
        if (yearReg != null && yearReg > 0) {
            sql.append(" AND vs.year_reg = ?");
            params.add(yearReg);
        }
        if (bodyType != null && !bodyType.isEmpty()) {
            sql.append(" AND LOWER(TRIM(vs.body_type)) = LOWER(TRIM(?))");
            params.add(bodyType);
        }
        if (mileage != null && mileage > 0) {
            sql.append(" AND vs.mileage <= ?");
            params.add(mileage);
        }

        return jdbcTemplate.query(sql.toString(), vehicleRowMapper, params.toArray());
    }    // admin section

    //  getting all inquiries
    public List<InquiryDetailDTO> getAllAdminInquiries() {
        String sql = "SELECT i.inquiry_id, i.inquiry_type, i.message, i.status, i.admin_reply, " +
                "u.user_id, u.full_name, u.phone, " +
                "v.vehicle_sale_id, v.brand, v.name as vehicle_name, v.price " +
                "FROM inquiries i " +
                "JOIN users u ON i.customer_id = u.user_id " +
                "JOIN vehicle_sale v ON i.vehicle_sale_id = v.vehicle_sale_id " +
                "ORDER BY i.inquiry_id DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            InquiryDetailDTO dto = new InquiryDetailDTO();
            dto.setInquiryId(rs.getLong("inquiry_id"));
            dto.setInquiryType(rs.getString("inquiry_type"));
            dto.setMessage(rs.getString("message"));
            dto.setStatus(rs.getString("status"));
            dto.setAdminReply(rs.getString("admin_reply"));
            dto.setCreatedAt("N/A");
            dto.setUserId(rs.getLong("user_id"));
            dto.setUserName(rs.getString("full_name"));
            dto.setUserPhone(rs.getString("phone"));
            dto.setVehicleId(rs.getLong("vehicle_sale_id"));
            dto.setVehicleBrand(rs.getString("brand"));
            dto.setVehicleName(rs.getString("vehicle_name"));
            dto.setVehiclePrice(rs.getBigDecimal("price"));
            return dto;
        });
    }

    //  update reply inq
    public void updateInquiryStatus(Long inquiryId, String status, String adminReply) {
        String sql = "UPDATE inquiries SET status = ?, admin_reply = ? WHERE inquiry_id = ?";
        jdbcTemplate.update(sql, status, adminReply, inquiryId);
    }

    // delete inq
    public void deleteInquiry(Long inquiryId) {
        String sql = "DELETE FROM inquiries WHERE inquiry_id = ?";
        jdbcTemplate.update(sql, inquiryId);
    }

    // make vehicle sold
    public void finalizeVehicleSale(Long vehicleId) {
        String sql = "UPDATE vehicle_sale SET status = 'Sold' WHERE vehicle_sale_id = ?";
        jdbcTemplate.update(sql, vehicleId);
    }

    // Report
    public List<TrendingVehicleDTO> getTrendingVehiclesReport() {
        String sql = "SELECT v.vehicle_sale_id, v.brand, v.name, COUNT(i.inquiry_id) as total_inquiries " +
                "FROM vehicle_sale v " +
                "JOIN inquiries i ON v.vehicle_sale_id = i.vehicle_sale_id " +
                "GROUP BY v.vehicle_sale_id, v.brand, v.name " +
                "ORDER BY total_inquiries DESC";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            TrendingVehicleDTO dto = new TrendingVehicleDTO();
            dto.setVehicleId(rs.getLong("vehicle_sale_id"));
            dto.setBrand(rs.getString("brand"));
            dto.setName(rs.getString("name"));
            dto.setTotalInquiries(rs.getInt("total_inquiries"));
            return dto;
        });
    }

    public void rejectOtherInquiriesForVehicle(Long vehicleId, Long acceptedInquiryId) {
        String sql = "UPDATE inquiries " +
                "SET status = 'REJECTED', admin_reply = 'We are sorry, but this vehicle has just been sold to another buyer.' " +
                "WHERE vehicle_sale_id = ? AND inquiry_id != ?";

        jdbcTemplate.update(sql, vehicleId, acceptedInquiryId);
    }

    // Helper to get Email, Name, and Car Name for Notifications
    public java.util.Map<String, String> getEmailDetailsForInquiry(Long inquiryId) {
        String sql = "SELECT u.email, u.full_name, v.name as car_name " +
                "FROM inquiries i " +
                "JOIN users u ON i.customer_id = u.user_id " +
                "JOIN vehicle_sale v ON i.vehicle_sale_id = v.vehicle_sale_id " +
                "WHERE i.inquiry_id = ?";

        return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
            java.util.Map<String, String> details = new java.util.HashMap<>();
            details.put("email", rs.getString("email"));
            details.put("name", rs.getString("full_name"));
            details.put("car", rs.getString("car_name"));
            return details;
        }, inquiryId);
    }
}