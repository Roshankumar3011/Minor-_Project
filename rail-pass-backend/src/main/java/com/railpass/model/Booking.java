package com.railpass.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "train_id")
    private Train train;

    @Column(unique = true)
    private String pnr;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate bookingDate;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "booking_id")
    @Builder.Default
    private List<Passenger> passengers = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "nominee_id")
    private Passenger nominee;

    @Builder.Default
    private Boolean isReplaced = false;

    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate journeyDate;

    private String classType; // GEN, SL, 1AC, 2AC, 3AC
    private Double fare;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private BookingStatus status;

    public enum BookingStatus {
        CONFIRMED, CANCELLED, COMPLETED
    }
}
