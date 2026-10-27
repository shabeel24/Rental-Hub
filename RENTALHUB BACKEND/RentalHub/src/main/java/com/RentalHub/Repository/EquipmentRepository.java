package com.RentalHub.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.RentalHub.Model.Equipment;

import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    // Empty string for q or category means "no filter"
    @Query("""
           select e from Equipment e
           where e.active = true
             and (:category = '' or lower(e.category) = lower(:category))
             and lower(e.name) like lower(concat('%', :q, '%'))
           order by e.name
           """)
    List<Equipment> search(@Param("q") String q, @Param("category") String category);
}