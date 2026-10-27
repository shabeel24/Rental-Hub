package com.RentalHub.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class EquipmentRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @Size(max = 1000, message = "Description can be at most 1000 characters")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Price per day is required")
    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal pricePerDay;

    @NotNull(message = "Deposit amount is required")
    @DecimalMin(value = "0.0", message = "Deposit cannot be negative")
    private BigDecimal depositAmount;

    @Min(value = 0, message = "Stock cannot be negative")
    private int totalStock;

    private String imageUrl;

    // Optional. Defaults to true on create; unchanged on update if omitted
    private Boolean active;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getPricePerDay() { return pricePerDay; }
    public void setPricePerDay(BigDecimal pricePerDay) { this.pricePerDay = pricePerDay; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }
    public int getTotalStock() { return totalStock; }
    public void setTotalStock(int totalStock) { this.totalStock = totalStock; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}