package com.railpass.repository;

import com.railpass.model.Train;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrainRepository extends JpaRepository<Train, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT t FROM Train t WHERE LOWER(TRIM(t.source)) = LOWER(TRIM(:source)) AND LOWER(TRIM(t.destination)) = LOWER(TRIM(:destination))")
    List<Train> findBySourceIgnoreCaseAndDestinationIgnoreCase(@org.springframework.data.repository.query.Param("source") String source, @org.springframework.data.repository.query.Param("destination") String destination);
}
