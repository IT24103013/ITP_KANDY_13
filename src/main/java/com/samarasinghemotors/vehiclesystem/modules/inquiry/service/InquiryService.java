package com.samarasinghemotors.vehiclesystem.modules.inquiry.service;

import com.samarasinghemotors.vehiclesystem.modules.inquiry.entity.Inquiry;
import com.samarasinghemotors.vehiclesystem.modules.inquiry.repository.InquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.samarasinghemotors.vehiclesystem.modules.inquiry.dto.InquiryDetailDTO;
import com.samarasinghemotors.vehiclesystem.modules.inquiry.dto.InquiryRequestDTO;
import com.samarasinghemotors.vehiclesystem.modules.inquiry.entity.Inquiry;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.dto.TrendingVehicleDTO;
import com.samarasinghemotors.vehiclesystem.modules.vehicle.repository.VehicleSaleRepository;
import com.samarasinghemotors.vehiclesystem.modules.user.repository.CustomerRepository;
import com.samarasinghemotors.vehiclesystem.modules.payment.service.EmailService;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class InquiryService {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private VehicleSaleRepository vehicleSaleRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmailService emailService;

    public List<InquiryDetailDTO> getAllAdminInquiries() {
        return inquiryRepository.findAllWithDetails().stream().map(i -> {
            InquiryDetailDTO dto = new InquiryDetailDTO();
            dto.setInquiryId(Long.valueOf(i.getInquiryId()));
            dto.setInquiryType(i.getInquiryType());
            dto.setMessage(i.getMessage());
            dto.setStatus(i.getStatus());
            dto.setAdminReply(i.getAdminReply());
            dto.setCreatedAt("N/A"); // Adjust if DB adds created_at
            
            if (i.getCustomer() != null) {
                dto.setUserId(Long.valueOf(i.getCustomer().getUserId()));
                dto.setUserName(i.getCustomer().getFullName());
                dto.setUserPhone(i.getCustomer().getPhone());
            }

            if (i.getVehicleSale() != null) {
                dto.setVehicleId(Long.valueOf(i.getVehicleSale().getVehicleSaleId()));
                dto.setVehicleBrand(i.getVehicleSale().getBrand());
                dto.setVehicleName(i.getVehicleSale().getName());
                dto.setVehiclePrice(i.getVehicleSale().getPrice());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateInquiryStatus(Integer inquiryId, String status, String adminReply) {
        inquiryRepository.updateStatusAndReply(inquiryId, status, adminReply);
        
        inquiryRepository.findById(inquiryId).ifPresent(i -> {
            if (i.getCustomer() != null && i.getVehicleSale() != null) {
                try {
                    emailService.sendInquiryUpdateEmail(
                            i.getCustomer().getEmail(),
                            i.getCustomer().getFullName(),
                            i.getVehicleSale().getName(),
                            status,
                            adminReply
                    );
                } catch (Exception ignored) {
                    // Logging omitted for brevity
                }
            }
        });
    }

    @Transactional
    public void deleteInquiry(Integer id) {
        inquiryRepository.deleteById(id);
    }

    @Transactional
    public void finalizeVehicleSale(Integer vehicleId, Integer winningInquiryId) {
        // 1. Mark vehicle sold
        vehicleSaleRepository.findById(vehicleId).ifPresent(v -> {
            v.setStatus("Sold");
            vehicleSaleRepository.save(v);
        });

        // 2. Mark winning buyer ACCEPTED
        inquiryRepository.updateStatusAndReply(winningInquiryId, "ACCEPTED", 
            "Congratulations, the sale is finalized! Please visit our showroom to complete the paperwork.");

        // 3. Fetch losing inquiries for mass notification
        List<Inquiry> losingInquiries = inquiryRepository.findOtherInquiries(vehicleId, winningInquiryId);

        // 4. Reject others in DB
        inquiryRepository.rejectOtherInquiries(vehicleId, winningInquiryId, 
            "We are sorry, but this vehicle has just been sold to another buyer.");

        // 5. Send Notification Contexts
        losingInquiries.forEach(inq -> {
            if (inq.getCustomer() != null && inq.getVehicleSale() != null) {
                try {
                    emailService.sendInquiryUpdateEmail(
                            inq.getCustomer().getEmail(),
                            inq.getCustomer().getFullName(),
                            inq.getVehicleSale().getName(),
                            "REJECTED",
                            "We are sorry, but this vehicle has just been sold to another buyer."
                    );
                } catch (Exception ignored) {}
            }
        });

        // 6. Send Email to Winner
        inquiryRepository.findById(winningInquiryId).ifPresent(i -> {
            if (i.getCustomer() != null && i.getVehicleSale() != null) {
                try {
                    emailService.sendInquiryUpdateEmail(
                            i.getCustomer().getEmail(),
                            i.getCustomer().getFullName(),
                            i.getVehicleSale().getName(),
                            "SOLD to YOU",
                            "Congratulations, the sale is finalized! Please visit our showroom to complete the paperwork."
                    );
                } catch (Exception ignored) {}
            }
        });
    }

    public List<TrendingVehicleDTO> getTrendingVehiclesReport() {
        return inquiryRepository.getTrendingVehiclesReportRaw().stream().map(obj -> {
            TrendingVehicleDTO dto = new TrendingVehicleDTO();
            dto.setVehicleId(obj[0] != null ? Long.valueOf(obj[0].toString()) : null);
            dto.setBrand(obj[1] != null ? (String) obj[1] : null);
            dto.setName(obj[2] != null ? (String) obj[2] : null);
            dto.setTotalInquiries(obj[3] != null ? Integer.valueOf(obj[3].toString()) : 0);
            return dto;
        }).collect(Collectors.toList());
    }

    public Inquiry createInquiry(Inquiry inquiry) {
        return inquiryRepository.save(inquiry);
    }

    public List<Inquiry> getAllInquiries() {
        return inquiryRepository.findAll();
    }

    public Inquiry updateInquiry(Inquiry inquiry) {
        return inquiryRepository.save(inquiry);
    }

    public Optional<Inquiry> getInquiryById(Integer id) {
        return inquiryRepository.findById(id);
    }

    @Transactional
    public Inquiry submitInquiry(InquiryRequestDTO dto) {
        Inquiry inquiry = new Inquiry();
        inquiry.setInquiryType(dto.inquiryType());
        inquiry.setMessage(dto.message());
        inquiry.setStatus("Unread");
        
        customerRepository.findById(dto.customerId().intValue()).ifPresent(inquiry::setCustomer);
        vehicleSaleRepository.findById(dto.vehicleSaleId().intValue()).ifPresent(inquiry::setVehicleSale);
        
        return inquiryRepository.save(inquiry);
    }
}
