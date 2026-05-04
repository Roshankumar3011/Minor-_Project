package com.railpass.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "train_schedules", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"train_id", "journeyDate"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "train_id")
    private Train train;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate journeyDate;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "schedule_seat_availabilities", joinColumns = @JoinColumn(name = "schedule_id"))
    private List<TrainSeatAvailability> seatAvailabilities;
}
