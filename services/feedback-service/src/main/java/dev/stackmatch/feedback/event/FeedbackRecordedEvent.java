package dev.stackmatch.feedback.event;

import java.time.Instant;

public record FeedbackRecordedEvent(
        String userId,
        String repoId,
        String signal,
        int rankPosition,
        Instant timestamp
) {}
