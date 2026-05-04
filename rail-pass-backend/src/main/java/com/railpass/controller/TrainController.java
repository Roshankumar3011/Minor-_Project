package com.railpass.controller;

import com.railpass.model.Train;
import com.railpass.model.TrainSchedule;
import com.railpass.service.TrainService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.List;

@RestController
@RequestMapping("/api/trains")
public class TrainController {
    @Autowired
    private TrainService trainService;

    @GetMapping("/search")
    public List<Train> search(@RequestParam String source, @RequestParam String destination, @RequestParam String date) {
        System.out.println("Searching trains: " + source + " to " + destination + " on " + date);
        java.time.LocalDate journeyDate = java.time.LocalDate.parse(date);
        return trainService.searchTrains(source, destination, journeyDate);
    }
    
    @GetMapping("/all")
    public List<Train> getAll() {
        return trainService.getAllTrains();
    }

    @PostMapping("/add")
    public Train add(@RequestBody Train train) {
        return trainService.addTrain(train);
    }

    @PutMapping("/update/{id}")
    public Train update(@PathVariable Long id, @RequestBody Train train) {
        return trainService.updateTrain(id, train);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            trainService.deleteTrain(id);
            return ResponseEntity.ok().body("Train deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(400).body("Failed to delete train: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, @RequestParam(required = false) String date) {
        try {
            System.out.println("Fetching train by ID: " + id + (date != null ? " for date: " + date : ""));
            Train train = trainService.getTrainById(id);
            
            if (date != null && !date.isEmpty()) {
                java.time.LocalDate journeyDate = java.time.LocalDate.parse(date);
                TrainSchedule schedule = trainService.getOrCreateSchedule(id, journeyDate);
                train.setSeatAvailabilities(schedule.getSeatAvailabilities());
                
                // Map availability to seatConfigs for frontend
                if (train.getSeatConfigs() != null) {
                    train.getSeatConfigs().forEach(config -> {
                        schedule.getSeatAvailabilities().stream()
                                .filter(a -> a.getClassType().equals(config.getClassType()))
                                .findFirst()
                                .ifPresent(a -> config.setAvailableSeats(a.getAvailableSeats()));
                    });
                }
            }
            
            System.out.println("Found train: " + train.getName());
            return ResponseEntity.ok(train);
        } catch (Exception e) {
            System.err.println("Error fetching train: " + e.getMessage());
            return ResponseEntity.status(404).body(e.getMessage());
        }
    }
}
