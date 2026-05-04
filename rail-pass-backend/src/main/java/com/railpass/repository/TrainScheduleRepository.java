package com.railpass.repository;

import com.railpass.model.Train;
import com.railpass.model.TrainSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface TrainScheduleRepository extends JpaRepository<TrainSchedule, Long> {
    Optional<TrainSchedule> findByTrainAndJourneyDate(Train train, LocalDate journeyDate);
    void deleteByTrain(Train train);
}
