package com.railpass.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "passengers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Passenger {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer age;
    private String gender;
    
    @Enumerated(EnumType.STRING)
    private PassengerType type; // PRIMARY, NOMINEE

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PassengerStatus status;

    public enum PassengerType {
        PRIMARY, NOMINEE
    }

    public enum PassengerStatus {
        CONFIRMED, CANCELLED
    }
}
