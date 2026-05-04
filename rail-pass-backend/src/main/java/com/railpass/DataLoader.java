package com.railpass;

import com.railpass.model.Train;
import com.railpass.model.User;
import com.railpass.repository.TrainRepository;
import com.railpass.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import com.railpass.model.TrainSeatConfig;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, TrainRepository trainRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Forcefully ensure admin exists and is correctly encoded
            userRepository.findByEmail("admin@railpass.com").ifPresentOrElse(
                existingAdmin -> {
                    if (!existingAdmin.getPassword().startsWith("$2a$")) {
                        existingAdmin.setPassword(passwordEncoder.encode("admin123"));
                        userRepository.save(existingAdmin);
                    }
                },
                () -> {
                    String adminPassword = passwordEncoder.encode("admin123");
                    User admin = User.builder()
                            .name("Admin System")
                            .username("admin@railpass.com")
                            .email("admin@railpass.com")
                            .password(adminPassword)
                            .role("ADMIN")
                            .phone("0987654321")
                            .build();
                    userRepository.save(admin);
                }
            );

            // Ensure default user exists and is correctly encoded
            userRepository.findByEmail("roshan@example.com").ifPresentOrElse(
                existingUser -> {
                    if (!existingUser.getPassword().startsWith("$2a$")) {
                        existingUser.setPassword(passwordEncoder.encode("password"));
                        userRepository.save(existingUser);
                    }
                },
                () -> {
                    String userPassword = passwordEncoder.encode("password");
                    User user = User.builder()
                            .name("Roshan Kumar")
                            .username("roshan@example.com")
                            .email("roshan@example.com")
                            .password(userPassword)
                            .role("USER")
                            .phone("1234567890")
                            .build();
                    userRepository.save(user);
                }
            );

            // Normalize existing trains (Lowercase and Trimmed)
            trainRepository.findAll().forEach(train -> {
                boolean modified = false;
                if (train.getSource() != null && (!train.getSource().equals(train.getSource().trim().toLowerCase()))) {
                    train.setSource(train.getSource().trim().toLowerCase());
                    modified = true;
                }
                if (train.getDestination() != null && (!train.getDestination().equals(train.getDestination().trim().toLowerCase()))) {
                    train.setDestination(train.getDestination().trim().toLowerCase());
                    modified = true;
                }
                if (modified) {
                    System.out.println("Normalizing train: " + train.getName() + " (#" + train.getTrainNumber() + ")");
                    trainRepository.save(train);
                }
            });

            if (trainRepository.count() == 0) {
                trainRepository.save(Train.builder()
                        .trainNumber("12432")
                        .name("Rajdhani Express")
                        .source("New Delhi")
                        .destination("Mumbai")
                        .departureTime(LocalDateTime.now().plusDays(1).withHour(16).withMinute(0))
                        .arrivalTime(LocalDateTime.now().plusDays(2).withHour(8).withMinute(0))
                        .seatConfigs(Arrays.asList(
                            new TrainSeatConfig("GEN", 100, 200.0),
                            new TrainSeatConfig("SL", 200, 500.0),
                            new TrainSeatConfig("3AC", 100, 1200.0),
                            new TrainSeatConfig("2AC", 50, 1800.0),
                            new TrainSeatConfig("1AC", 20, 3000.0)
                        ))
                        .runningDays(Arrays.asList("MON", "WED", "FRI", "SUN"))
                        .build());

                trainRepository.save(Train.builder()
                        .trainNumber("22435")
                        .name("Vande Bharat")
                        .source("New Delhi")
                        .destination("Varanasi")
                        .departureTime(LocalDateTime.now().plusDays(1).withHour(6).withMinute(0))
                        .arrivalTime(LocalDateTime.now().plusDays(1).withHour(14).withMinute(0))
                        .seatConfigs(Arrays.asList(
                            new TrainSeatConfig("GEN", 120, 150.0),
                            new TrainSeatConfig("SL", 150, 400.0),
                            new TrainSeatConfig("3AC", 80, 1000.0)
                        ))
                        .runningDays(Arrays.asList("TUE", "THU", "SAT"))
                        .build());
            }
        };
    }
}
