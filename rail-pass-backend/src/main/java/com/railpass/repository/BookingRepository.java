package com.railpass.repository;

import com.railpass.model.Booking;
import com.railpass.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByPnr(String pnr);
    List<Booking> findByUser(User user);
    List<Booking> findByTrainAndJourneyDateAndStatus(com.railpass.model.Train train, java.time.LocalDate journeyDate, Booking.BookingStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT SUM(SIZE(b.passengers)) FROM Booking b WHERE b.train = :train AND b.journeyDate = :journeyDate AND b.classType = :classType AND b.status = 'CONFIRMED'")
    Integer countBookedSeats(com.railpass.model.Train train, java.time.LocalDate journeyDate, String classType);

    void deleteByTrain(com.railpass.model.Train train);
}
