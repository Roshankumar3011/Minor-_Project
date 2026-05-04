package com.railpass.service;

import com.railpass.model.Booking;
import com.railpass.model.Passenger;
import com.railpass.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class ReplacementService {
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private BookingService bookingService;

    public String replacePassenger(String pnr, String otp, Long passengerId) {
        Booking booking = bookingService.getBookingByPnr(pnr);
        
        // 0. Check if nominee exists
        if (booking.getNominee() == null) {
            throw new RuntimeException("No nominee found for this booking. Replacement not possible.");
        }
        if (booking.getIsReplaced()) {
            throw new RuntimeException("Replacement already done for this booking. Only once allowed.");
        }

        // 1. Verify Passenger exists in this booking
        Passenger targetPassenger = booking.getPassengers().stream()
                .filter(p -> p.getId().equals(passengerId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Selected passenger not found in this booking."));

        if (targetPassenger.getStatus() == Passenger.PassengerStatus.CANCELLED) {
            throw new RuntimeException("Passenger is already cancelled.");
        }
        
        // 2. Check 15-hour rule (Combine journey date and train departure time)
        LocalDate journeyDate = booking.getJourneyDate();
        LocalDateTime trainDeparture = booking.getTrain().getDepartureTime();
        
        // Combine date from journeyDate and time from trainDeparture
        LocalDateTime actualDeparture = LocalDateTime.of(journeyDate, trainDeparture.toLocalTime());
        
        LocalDateTime now = LocalDateTime.now();
        long hoursRemaining = Duration.between(now, actualDeparture).toHours();

        if (hoursRemaining < 15) {
            throw new RuntimeException("Replacement allowed only up to 15 hours before departure");
        }

        // 3. OTP Verification (Mock)
        if (!"123456".equals(otp)) {
            throw new RuntimeException("Invalid OTP. Verification failed.");
        }

        // 4. Perform Replacement
        booking.setIsReplaced(true);
        
        // Cancel target passenger
        targetPassenger.setStatus(Passenger.PassengerStatus.CANCELLED);
        
        // Nominee is now CONFIRMED
        booking.getNominee().setStatus(Passenger.PassengerStatus.CONFIRMED);
        
        bookingRepository.save(booking);
        return "Passenger replacement successful for " + targetPassenger.getName() + " (PNR: " + pnr + "). Nominee is now the confirmed passenger.";
    }
}
