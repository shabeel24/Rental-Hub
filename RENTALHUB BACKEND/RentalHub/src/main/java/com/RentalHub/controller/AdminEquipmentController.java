package com.RentalHub.controller;


import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.RentalHub.Service.EquipmentService;
import com.RentalHub.dto.EquipmentRequest;
import com.RentalHub.dto.EquipmentResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/equipment")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEquipmentController {

    private final EquipmentService service;

    public AdminEquipmentController(EquipmentService service) {
        this.service = service;
    }

    // All items, including deactivated ones
    @GetMapping
    public List<EquipmentResponse> listAll() {
        return service.listAll();
    }

    @GetMapping("/{id}")
    public EquipmentResponse get(@PathVariable Long id) {
        return service.getAny(id);
    }

    @PostMapping
    public ResponseEntity<EquipmentResponse> create(@Valid @RequestBody EquipmentRequest req,
                                                    Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, auth.getName()));
    }

    @PutMapping("/{id}")
    public EquipmentResponse update(@PathVariable Long id,
                                    @Valid @RequestBody EquipmentRequest req,
                                    Authentication auth) {
        return service.update(id, req, auth.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id, Authentication auth) {
        service.deactivate(id, auth.getName());
        return ResponseEntity.ok(Map.of("message", "Equipment removed from the catalogue"));
    }
}