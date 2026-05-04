package com.railpass.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "trains")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Transient
    private List<TrainSeatAvailability> seatAvailabilities;

    @Column(unique = true, nullable = false)
    private String trainNumber;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String source;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private LocalDateTime arrivalTime;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "train_seat_configs", joinColumns = @JoinColumn(name = "train_id"))
    private List<TrainSeatConfig> seatConfigs;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "train_running_days", joinColumns = @JoinColumn(name = "train_id"))
    @Column(name = "day")
    private List<String> runningDays;
}
