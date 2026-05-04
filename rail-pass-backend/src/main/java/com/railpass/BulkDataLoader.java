package com.railpass;

import com.railpass.model.Train;
import com.railpass.model.TrainSeatConfig;
import com.railpass.repository.TrainRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Configuration
public class BulkDataLoader {

    private static final String[] CITIES = {
        "patna", "ara", "bhagalpur", "delhi", "mumbai", "kolkata", "chennai", "bangalore", "hyderabad", "pune",
        "lucknow", "jaipur", "ahmedabad", "surat", "kanpur", "nagpur", "indore", "thane", "bhopal", "visakhapatnam"
    };

    private static final String[] TRAIN_TYPES = {
        "Express", "Superfast", "Mail", "Jan Shatabdi", "Shatabdi", "Rajdhani", "Duronto", "Garib Rath", "Humsafar"
    };

    private static final List<String> ALL_DAYS = Arrays.asList("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");

    @Bean
    public CommandLineRunner bulkInsert(TrainRepository trainRepository) {
        return args -> {
            long currentCount = trainRepository.count();
            if (currentCount < 500) { // Only run if database is relatively empty
                System.out.println("--- STARTING BULK TRAIN INSERTION (1000 RECORDS) ---");
                performBulkInsert(trainRepository);
                System.out.println("--- BULK INSERTION COMPLETED SUCCESSFULLY ---");
            } else {
                System.out.println("Database already has " + currentCount + " trains. Skipping bulk insert.");
            }
        };
    }

    @Transactional
    public void performBulkInsert(TrainRepository trainRepository) {
        Random random = new Random();
        List<Train> batch = new ArrayList<>();
        int batchSize = 100;

        for (int i = 1; i <= 1000; i++) {
            String source = CITIES[random.nextInt(CITIES.length)];
            String destination;
            do {
                destination = CITIES[random.nextInt(CITIES.length)];
            } while (source.equals(destination));

            String trainName = source.toUpperCase() + " " + TRAIN_TYPES[random.nextInt(TRAIN_TYPES.length)];
            String trainNumber = String.format("%05d", 30000 + i);

            // Generate random timings
            LocalDateTime departure = LocalDateTime.now()
                .plusDays(random.nextInt(30))
                .withHour(random.nextInt(24))
                .withMinute(random.nextInt(60));
            
            LocalDateTime arrival = departure.plusHours(2 + random.nextInt(24)).plusMinutes(random.nextInt(60));

            // Seat Configurations
            List<TrainSeatConfig> seatConfigs = Arrays.asList(
                new TrainSeatConfig("GEN", 50 + random.nextInt(100), 100.0 + random.nextInt(200)),
                new TrainSeatConfig("SL", 100 + random.nextInt(200), 300.0 + random.nextInt(400)),
                new TrainSeatConfig("3AC", 40 + random.nextInt(80), 800.0 + random.nextInt(1000)),
                new TrainSeatConfig("2AC", 20 + random.nextInt(40), 1500.0 + random.nextInt(1500)),
                new TrainSeatConfig("1AC", 10 + random.nextInt(20), 2500.0 + random.nextInt(2500))
            );

            // Random Running Days (at least 3 days)
            List<String> runningDays = new ArrayList<>();
            int daysCount = 3 + random.nextInt(5);
            for (int d = 0; d < daysCount; d++) {
                String day = ALL_DAYS.get(random.nextInt(ALL_DAYS.size()));
                if (!runningDays.contains(day)) {
                    runningDays.add(day);
                }
            }

            Train train = Train.builder()
                .trainNumber(trainNumber)
                .name(trainName)
                .source(source) // Already normalized to lowercase in CITIES array
                .destination(destination) // Already normalized to lowercase
                .departureTime(departure)
                .arrivalTime(arrival)
                .seatConfigs(seatConfigs)
                .runningDays(runningDays)
                .build();

            batch.add(train);

            if (i % batchSize == 0) {
                trainRepository.saveAll(batch);
                batch.clear();
                System.out.println("Inserted " + i + " trains...");
            }
        }
        
        if (!batch.isEmpty()) {
            trainRepository.saveAll(batch);
        }
    }
}
