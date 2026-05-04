package com.railpass.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrainSeatConfig {
    private String classType; // GEN, SL, 1AC, 2AC, 3AC
    private Integer totalSeats;
    private Double price;

    @jakarta.persistence.Transient
    private Integer availableSeats;

    public TrainSeatConfig(String classType, Integer totalSeats, Double price) {
        this.classType = classType;
        this.totalSeats = totalSeats;
        this.price = price;
    }
}
