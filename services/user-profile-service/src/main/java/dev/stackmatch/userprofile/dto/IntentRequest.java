package dev.stackmatch.userprofile.dto;

import dev.stackmatch.userprofile.domain.enums.UserIntent;
import jakarta.validation.constraints.NotNull;

public record IntentRequest(
        @NotNull UserIntent intent
) {}
