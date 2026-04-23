package dev.stackmatch.feedback.service;

import dev.stackmatch.feedback.domain.entity.FeedbackSignal;
import dev.stackmatch.feedback.domain.enums.SignalType;
import dev.stackmatch.feedback.dto.FeedbackRequest;
import dev.stackmatch.feedback.event.EmbeddingUpdateEvent;
import dev.stackmatch.feedback.event.FeedbackRecordedEvent;
import dev.stackmatch.feedback.repository.FeedbackSignalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackSignalRepository feedbackRepo;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    private static final int EMBEDDING_UPDATE_THRESHOLD = 5;

    @Transactional
    public void recordFeedback(UUID userId, FeedbackRequest request) {
        // 1. Persist feedback signal
        var signal = FeedbackSignal.builder()
                .userId(userId)
                .repoId(request.repoId())
                .sessionId(request.sessionId())
                .signal(SignalType.valueOf(request.signal()))
                .rankPosition(request.rankPosition())
                .createdAt(Instant.now())
                .build();

        feedbackRepo.save(signal);

        // 2. Publish raw feedback event
        kafkaTemplate.send("feedback.signal", userId.toString(),
                new FeedbackRecordedEvent(
                        userId.toString(),
                        request.repoId().toString(),
                        request.signal(),
                        request.rankPosition(),
                        Instant.now()
                ));

        // 3. Check if we should trigger embedding update
        long recentSignals = feedbackRepo.countRecentSignals(
                userId, Instant.now().minusSeconds(3600));

        if (recentSignals % EMBEDDING_UPDATE_THRESHOLD == 0 && recentSignals > 0) {
            var recentFeedback = feedbackRepo.findRecentByUser(userId, 20);
            triggerEmbeddingUpdate(userId, recentFeedback);
        }
    }

    private void triggerEmbeddingUpdate(UUID userId, List<FeedbackSignal> recentSignals) {
        var likedRepos = recentSignals.stream()
                .filter(s -> s.getSignal() == SignalType.LIKE || s.getSignal() == SignalType.STAR)
                .map(s -> s.getRepoId().toString())
                .toList();

        var dislikedRepos = recentSignals.stream()
                .filter(s -> s.getSignal() == SignalType.DISLIKE)
                .map(s -> s.getRepoId().toString())
                .toList();

        if (likedRepos.isEmpty() && dislikedRepos.isEmpty()) return;

        kafkaTemplate.send("feedback.embedding.update", userId.toString(),
                new EmbeddingUpdateEvent(
                        userId.toString(),
                        likedRepos,
                        dislikedRepos,
                        Instant.now()
                ));

        log.info("Triggered embedding update for user {} — {} likes, {} dislikes",
                userId, likedRepos.size(), dislikedRepos.size());
    }

    public List<FeedbackSignal> getUserFeedbackHistory(UUID userId) {
        return feedbackRepo.findTopByUserIdOrderByCreatedAtDesc(userId);
    }
}
