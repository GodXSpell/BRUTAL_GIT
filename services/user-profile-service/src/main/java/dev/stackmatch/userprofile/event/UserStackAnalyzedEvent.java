package dev.stackmatch.userprofile.event;

import dev.stackmatch.userprofile.domain.entity.UserStackProfile;

public record UserStackAnalyzedEvent(
        String githubLogin,
        UserStackProfile stackProfile
) {}
