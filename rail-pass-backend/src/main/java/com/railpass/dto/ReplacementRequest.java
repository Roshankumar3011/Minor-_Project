package com.railpass.dto;

import lombok.Data;

@Data
public class ReplacementRequest {
    private String pnr;
    private String otp;
    private Long passengerId;
}
