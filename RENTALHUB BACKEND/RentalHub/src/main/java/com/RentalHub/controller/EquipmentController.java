package com.RentalHub.controller;


import org.springframework.web.bind.annotation.*;

import com.RentalHub.Service.EquipmentService;
import com.RentalHub.dto.EquipmentResponse;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService service;

    public EquipmentController(EquipmentService service) {
        this.service = service;
    }

    // GET /api/equipment?q=chair&category=Furniture
    @GetMapping
    public List<EquipmentResponse> list(@RequestParam(required = false) String q,
                                        @RequestParam(required = false) String category) {
        return service.search(q, category);
    }

    @GetMapping("/{id}")
    public EquipmentResponse get(@PathVariable Long id) {
        return service.getActive(id);
    }
}