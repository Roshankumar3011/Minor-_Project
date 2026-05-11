package com.railpass.service;

import com.railpass.dto.BookingRequest;
import com.railpass.model.*;
import com.railpass.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TrainService trainService;

    @Transactional
    public Booking bookTicket(BookingRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Train train = trainService.getTrainById(request.getTrainId());
        
        LocalDate journeyDate = request.getJourneyDate();
        LocalDate today = LocalDate.now();

        if (journeyDate.isBefore(today)) {
            throw new RuntimeException("Booking allowed only for today or future dates");
        }

        LocalDate maxDate = today.plusMonths(2);
        if (journeyDate.isAfter(maxDate)) {
            throw new RuntimeException("Booking allowed only within 2 months from today (until " + maxDate + ")");
        }

        if (request.getPassengers() == null || request.getPassengers().isEmpty()) {
            throw new RuntimeException("At least one passenger is required");
        }

        TrainSchedule schedule = trainService.getOrCreateSchedule(train.getId(), journeyDate);

        TrainSeatAvailability classAvailability = schedule.getSeatAvailabilities().stream()
                .filter(a -> a.getClassType().equals(request.getClassType()))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Seat class not found: " + request.getClassType()));

        int passengerCount = request.getPassengers().size();
        if (classAvailability.getAvailableSeats() < passengerCount) {
            throw new RuntimeException("Only " + classAvailability.getAvailableSeats() + " seats available for class: " + request.getClassType());
        }

        Double baseFare = train.getSeatConfigs().stream()
                .filter(c -> c.getClassType().equals(request.getClassType()))
                .findFirst()
                .map(TrainSeatConfig::getPrice)
                .orElseThrow(() -> new RuntimeException("Fare not found for class: " + request.getClassType()));

        Double totalFare = baseFare * passengerCount;

        List<Passenger> passengers = request.getPassengers().stream()
                .map(p -> Passenger.builder()
                        .name(p.getName())
                        .age(p.getAge())
                        .gender(p.getGender())
                        .type(Passenger.PassengerType.PRIMARY)
                        .status(Passenger.PassengerStatus.CONFIRMED)
                        .build())
                .collect(Collectors.toList());

        Passenger nominee = null;
        if (request.getNomineeName() != null && !request.getNomineeName().trim().isEmpty()) {
            nominee = Passenger.builder()
                    .name(request.getNomineeName())
                    .age(request.getNomineeAge())
                    .gender(request.getNomineeGender())
                    .type(Passenger.PassengerType.NOMINEE)
                    .status(Passenger.PassengerStatus.CONFIRMED)
                    .build();
        }

        String pnr = UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Booking booking = Booking.builder()
                .user(user)
                .train(train)
                .pnr(pnr)
                .bookingDate(LocalDate.now())
                .journeyDate(request.getJourneyDate())
                .classType(request.getClassType())
                .fare(totalFare)
                .passengers(passengers)
                .nominee(nominee)
                .isReplaced(false)
                .status(Booking.BookingStatus.CONFIRMED)
                .build();

        trainService.updateAvailability(train.getId(), journeyDate, request.getClassType(), passengerCount);
        return bookingRepository.save(booking);
    }

    @Transactional
    public void cancelTicket(String pnr) {
        Booking booking = getBookingByPnr(pnr);
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Ticket is already cancelled");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.getPassengers().forEach(p -> p.setStatus(Passenger.PassengerStatus.CANCELLED));
        if (booking.getNominee() != null) {
            booking.getNominee().setStatus(Passenger.PassengerStatus.CANCELLED);
        }
        
        long confirmedCount = booking.getPassengers().stream()
                .filter(p -> p.getStatus() == Passenger.PassengerStatus.CONFIRMED)
                .count();

        booking.getPassengers().forEach(p -> p.setStatus(Passenger.PassengerStatus.CANCELLED));
        
        trainService.updateAvailability(booking.getTrain().getId(), booking.getJourneyDate(), booking.getClassType(), -(int)confirmedCount);
        bookingRepository.save(booking);
    }

    @Transactional
    public void cancelSinglePassenger(String pnr, Long passengerId) {
        Booking booking = getBookingByPnr(pnr);
        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new RuntimeException("Ticket is already cancelled");
        }

        Passenger passengerToCancel = booking.getPassengers().stream()
                .filter(p -> p.getId().equals(passengerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Passenger not found in this booking"));

        if (passengerToCancel.getStatus() == Passenger.PassengerStatus.CANCELLED) {
            throw new RuntimeException("Passenger is already cancelled");
        }

        passengerToCancel.setStatus(Passenger.PassengerStatus.CANCELLED);

        // Update seat availability (+1)
        trainService.updateAvailability(booking.getTrain().getId(), booking.getJourneyDate(), booking.getClassType(), -1);

        // Check if all passengers are now cancelled
        boolean allCancelled = booking.getPassengers().stream()
                .allMatch(p -> p.getStatus() == Passenger.PassengerStatus.CANCELLED);

        if (allCancelled) {
            booking.setStatus(Booking.BookingStatus.CANCELLED);
            if (booking.getNominee() != null) {
                booking.getNominee().setStatus(Passenger.PassengerStatus.CANCELLED);
            }
        }

        bookingRepository.save(booking);
    }

    public List<Booking> getBookingHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return bookingRepository.findByUser(user);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingByPnr(String pnr) {
        return bookingRepository.findByPnr(pnr)
                .orElseThrow(() -> new RuntimeException("Booking not found with PNR: " + pnr));
    }
}
