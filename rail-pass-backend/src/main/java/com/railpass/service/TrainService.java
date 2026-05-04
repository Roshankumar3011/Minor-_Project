package com.railpass.service;

import com.railpass.model.Train;
import com.railpass.model.TrainSchedule;
import com.railpass.model.TrainSeatAvailability;
import com.railpass.model.TrainSeatConfig;
import com.railpass.repository.BookingRepository;
import com.railpass.repository.TrainRepository;
import com.railpass.repository.TrainScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainService {
    @Autowired
    private TrainRepository trainRepository;
    @Autowired
    private TrainScheduleRepository trainScheduleRepository;
    @Autowired
    private BookingRepository bookingRepository;

    public TrainSchedule getOrCreateSchedule(Long trainId, java.time.LocalDate date) {
        Train train = getTrainById(trainId);
        return trainScheduleRepository.findByTrainAndJourneyDate(train, date)
                .orElseGet(() -> {
                    List<TrainSeatAvailability> availabilities = train.getSeatConfigs().stream()
                            .map(config -> {
                                Integer booked = bookingRepository.countBookedSeats(train, date, config.getClassType());
                                int available = config.getTotalSeats() - (booked != null ? booked : 0);
                                return TrainSeatAvailability.builder()
                                        .classType(config.getClassType())
                                        .availableSeats(available)
                                        .build();
                            })
                            .collect(Collectors.toList());
                            
                    TrainSchedule newSchedule = TrainSchedule.builder()
                            .train(train)
                            .journeyDate(date)
                            .seatAvailabilities(availabilities)
                            .build();
                    return trainScheduleRepository.save(newSchedule);
                });
    }

    public void updateAvailability(Long trainId, java.time.LocalDate date, String classType, int count) {
        TrainSchedule schedule = getOrCreateSchedule(trainId, date);
        schedule.getSeatAvailabilities().stream()
                .filter(a -> a.getClassType().equals(classType))
                .findFirst()
                .ifPresent(a -> a.setAvailableSeats(a.getAvailableSeats() - count));
        trainScheduleRepository.save(schedule);
    }

    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }

    public List<Train> searchTrains(String source, String destination, java.time.LocalDate journeyDate) {
        String shortDay = journeyDate.getDayOfWeek().name().substring(0, 3); // "MON", "TUE", etc.
        
        String trimmedSource = source != null ? source.trim().toLowerCase() : "";
        String trimmedDest = destination != null ? destination.trim().toLowerCase() : "";
        
        System.out.println("--- SEARCH DIAGNOSTICS ---");
        System.out.println("Target: [" + trimmedSource + "] -> [" + trimmedDest + "] | Date: " + journeyDate + " (" + shortDay + ")");

        List<Train> allTrains = trainRepository.findAll();
        System.out.println("Total Trains in System: " + allTrains.size());

        List<Train> routeMatches = allTrains.stream()
                .filter(t -> {
                    String s = t.getSource() != null ? t.getSource().trim().toLowerCase() : "";
                    String d = t.getDestination() != null ? t.getDestination().trim().toLowerCase() : "";
                    boolean match = s.equals(trimmedSource) && d.equals(trimmedDest);
                    if (match) System.out.println("MATCH FOUND: " + t.getName() + " (#" + t.getTrainNumber() + ")");
                    return match;
                })
                .toList();
        
        System.out.println("Trains on this route: " + routeMatches.size());

        List<Train> filtered = routeMatches.stream()
                .filter(t -> {
                    boolean runsToday = t.getRunningDays() == null || t.getRunningDays().isEmpty() || t.getRunningDays().contains(shortDay);
                    System.out.println("Filtering " + t.getName() + ": RunningDays=" + t.getRunningDays() + " | shortDay=" + shortDay + " | RunsToday=" + runsToday);
                    return runsToday;
                })
                .map(train -> {
                    TrainSchedule schedule = getOrCreateSchedule(train.getId(), journeyDate);
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
                    
                    return train;
                })
                .toList();
        
        System.out.println("Final Result Count: " + filtered.size());
        System.out.println("--------------------------");
        return filtered;
    }

    public Train addTrain(Train train) {
        return trainRepository.save(train);
    }

    public Train updateTrain(Long id, Train trainDetails) {
        Train train = getTrainById(id);
        train.setTrainNumber(trainDetails.getTrainNumber());
        train.setName(trainDetails.getName());
        train.setSource(trainDetails.getSource());
        train.setDestination(trainDetails.getDestination());
        train.setDepartureTime(trainDetails.getDepartureTime());
        train.setArrivalTime(trainDetails.getArrivalTime());
        train.setSeatConfigs(trainDetails.getSeatConfigs());
        train.setRunningDays(trainDetails.getRunningDays());
        return trainRepository.save(train);
    }


    @org.springframework.transaction.annotation.Transactional
    public void deleteTrain(Long id) {
        Train train = getTrainById(id);
        // Delete related bookings first
        bookingRepository.deleteByTrain(train);
        // Delete related schedules
        trainScheduleRepository.deleteByTrain(train);
        // Finally delete the train
        trainRepository.delete(train);
    }

    public Train getTrainById(Long id) {
        return trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found with ID: " + id));
    }
}
