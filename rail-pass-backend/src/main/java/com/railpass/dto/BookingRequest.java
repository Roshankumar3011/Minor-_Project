package com.railpass.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BookingRequest {
    private Long userId;
    private Long trainId;
    private List<PassengerDTO> passengers;
    private String nomineeName;
    private Integer nomineeAge;
    private String nomineeGender;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate journeyDate;
    private String classType;

    @Data
    public static class PassengerDTO {
        private String name;
        private Integer age;
        private String gender;
    }
}
