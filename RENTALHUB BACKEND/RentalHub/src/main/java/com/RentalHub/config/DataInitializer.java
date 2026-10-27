package com.RentalHub.config;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.RentalHub.Model.Equipment;
import com.RentalHub.Model.Role;
import com.RentalHub.Model.User;
import com.RentalHub.Repository.EquipmentRepository;
import com.RentalHub.Repository.UserRepository;

import java.math.BigDecimal;

@Configuration
public class DataInitializer {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Bean
    CommandLineRunner seedData(UserRepository users,
                               EquipmentRepository equipment,
                               PasswordEncoder encoder) {
        return args -> {
            if (!users.existsByEmail("admin@rentalhub.com")) {
                User admin = new User();
                admin.setFullName("System Admin");
                admin.setEmail("admin@rentalhub.com");
                admin.setPassword(encoder.encode("Admin@12345"));   // change after first login
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                users.save(admin);
                log.warn("Default admin created: admin@rentalhub.com. Change this password!");
            }

            if (equipment.count() == 0) {
                equipment.save(item("Plastic Chair", "Furniture", "Stackable white chair", "5", "2", 200));
                equipment.save(item("Round Table", "Furniture", "6-seater round table", "40", "20", 40));
                equipment.save(item("Tent 20x20", "Tents", "Weatherproof event tent", "1500", "500", 6));
                equipment.save(item("PA Speaker Set", "Sound", "2 speakers with mixer", "1200", "800", 8));
                equipment.save(item("LED Par Light", "Lighting", "RGB stage light", "250", "100", 30));
                log.info("Sample equipment added");
            }
        };
    }

    private Equipment item(String name, String category, String description,
                           String price, String deposit, int stock) {
        Equipment e = new Equipment();
        e.setName(name);
        e.setCategory(category);
        e.setDescription(description);
        e.setPricePerDay(new BigDecimal(price));
        e.setDepositAmount(new BigDecimal(deposit));
        e.setTotalStock(stock);
        e.setActive(true);
        return e;
    }
}