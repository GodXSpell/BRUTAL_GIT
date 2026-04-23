package dev.stackmatch.feedback.repository;

import dev.stackmatch.feedback.domain.entity.FeedbackSignal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackSignalRepository extends JpaRepository<FeedbackSignal, UUID> {

    @Query("SELECT COUNT(f) FROM FeedbackSignal f WHERE f.userId = :userId AND f.createdAt > :since")
    long countRecentSignals(@Param("userId") UUID userId, @Param("since") Instant since);

    @Query("SELECT f FROM FeedbackSignal f WHERE f.userId = :userId ORDER BY f.createdAt DESC LIMIT :limit")
    List<FeedbackSignal> findRecentByUser(@Param("userId") UUID userId, @Param("limit") int limit);

    @Query("SELECT f FROM FeedbackSignal f WHERE f.userId = :userId ORDER BY f.createdAt DESC")
    List<FeedbackSignal> findTopByUserIdOrderByCreatedAtDesc(@Param("userId") UUID userId);
}
