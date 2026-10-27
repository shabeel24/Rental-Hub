package com.RentalHub.Service;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.RentalHub.Model.Equipment;
import com.RentalHub.Repository.EquipmentRepository;
import com.RentalHub.dto.EquipmentRequest;
import com.RentalHub.dto.EquipmentResponse;
import com.RentalHub.exception.ResourceNotFoundException;

import java.util.List;

@Service
public class EquipmentService {

    private static final Logger log = LoggerFactory.getLogger(EquipmentService.class);

    private final EquipmentRepository repo;

    public EquipmentService(EquipmentRepository repo) {
        this.repo = repo;
    }

    // ---------- public catalogue (active items only) ----------

    @Transactional(readOnly = true)
    public List<EquipmentResponse> search(String q, String category) {
        String query = q == null ? "" : q.trim();
        String cat = category == null ? "" : category.trim();
        return repo.search(query, cat).stream().map(EquipmentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getActive(Long id) {
        Equipment e = repo.findById(id)
                .filter(Equipment::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found: " + id));
        return EquipmentResponse.from(e);
    }

    // ---------- admin ----------

    @Transactional(readOnly = true)
    public List<EquipmentResponse> listAll() {
        return repo.findAll(Sort.by("id")).stream().map(EquipmentResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getAny(Long id) {
        return EquipmentResponse.from(find(id));
    }

    @Transactional
    public EquipmentResponse create(EquipmentRequest req, String adminEmail) {
        Equipment e = new Equipment();
        apply(e, req);
        e.setActive(req.getActive() == null || req.getActive());
        Equipment saved = repo.save(e);
        log.info("AUDIT equipment created id={} name={} by={}", saved.getId(), saved.getName(), adminEmail);
        return EquipmentResponse.from(saved);
    }

    @Transactional
    public EquipmentResponse update(Long id, EquipmentRequest req, String adminEmail) {
        Equipment e = find(id);
        apply(e, req);
        if (req.getActive() != null) {
            e.setActive(req.getActive());
        }
        Equipment saved = repo.save(e);
        log.info("AUDIT equipment updated id={} name={} by={}", saved.getId(), saved.getName(), adminEmail);
        return EquipmentResponse.from(saved);
    }

    // Soft delete: keeps history for past bookings. Restore with PUT and "active": true
    @Transactional
    public void deactivate(Long id, String adminEmail) {
        Equipment e = find(id);
        e.setActive(false);
        repo.save(e);
        log.info("AUDIT equipment deactivated id={} name={} by={}", e.getId(), e.getName(), adminEmail);
    }

    private Equipment find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found: " + id));
    }

    private void apply(Equipment e, EquipmentRequest req) {
        e.setName(req.getName().trim());
        e.setDescription(req.getDescription());
        e.setCategory(req.getCategory().trim());
        e.setPricePerDay(req.getPricePerDay());
        e.setDepositAmount(req.getDepositAmount());
        e.setTotalStock(req.getTotalStock());
        e.setImageUrl(req.getImageUrl());
    }
}