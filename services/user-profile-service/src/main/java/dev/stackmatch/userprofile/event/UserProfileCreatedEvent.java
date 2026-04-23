package dev.stackmatch.userprofile.event;

import java.time.Instant;

public record UserProfileCreatedEvent(
        String userId,
        String githubLogin,
        Instant timestamp
) {}
