package dev.stackmatch.feedback.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record FeedbackRequest(
        @NotNull UUID repoId,
        @NotNull UUID sessionId,
        @NotBlank String signal,
        int rankPosition
) {}
