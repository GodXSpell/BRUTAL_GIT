package dev.stackmatch.feedback.event;

import java.time.Instant;
import java.util.List;

public record EmbeddingUpdateEvent(
        String userId,
        List<String> likedRepoIds,
        List<String> dislikedRepoIds,
        Instant timestamp
) {}
