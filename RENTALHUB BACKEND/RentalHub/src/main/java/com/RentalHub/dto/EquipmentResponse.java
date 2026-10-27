package com.RentalHub.dto;



import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.RentalHub.Model.Equipment;

public class EquipmentResponse {

    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal pricePerDay;
    private BigDecimal depositAmount;
    private int totalStock;
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EquipmentResponse from(Equipment e) {
        EquipmentResponse r = new EquipmentResponse();
        r.id = e.getId();
        r.name = e.getName();
        r.description = e.getDescription();
        r.category = e.getCategory();
        r.pricePerDay = e.getPricePerDay();
        r.depositAmount = e.getDepositAmount();
        r.totalStock = e.getTotalStock();
        r.imageUrl = e.getImageUrl();
        r.active = e.isActive();
        r.createdAt = e.getCreatedAt();
        r.updatedAt = e.getUpdatedAt();
        return r;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getCategory() { return category; }
    public BigDecimal getPricePerDay() { return pricePerDay; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public int getTotalStock() { return totalStock; }
    public String getImageUrl() { return imageUrl; }
    public boolean isActive() { return active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}