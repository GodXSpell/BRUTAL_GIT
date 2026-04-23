package dev.stackmatch.userprofile.dto;

import dev.stackmatch.userprofile.domain.entity.User;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile.FrameworkEntry;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile.LanguageWeight;

import java.util.Collections;
import java.util.List;

public record UserProfileResponse(
        String userId,
        String githubLogin,
        String githubName,
        String githubAvatar,
        String email,
        StackProfileDto stackProfile
) {
    public static UserProfileResponse from(User user, UserStackProfile stack) {
        StackProfileDto stackDto = null;
        if (stack != null) {
            stackDto = new StackProfileDto(
                    stack.getPrimaryLanguages() != null ? stack.getPrimaryLanguages() : Collections.emptyList(),
                    stack.getFrameworks() != null ? stack.getFrameworks() : Collections.emptyList(),
                    stack.getDomains() != null ? stack.getDomains() : Collections.emptyList(),
                    stack.getActivityPattern() != null ? stack.getActivityPattern().name() : null,
                    stack.getIntent() != null ? stack.getIntent().name() : null,
                    stack.getTotalRepos() != null ? stack.getTotalRepos() : 0,
                    stack.getTotalStarsGiven() != null ? stack.getTotalStarsGiven() : 0,
                    stack.getLastAnalyzedAt() != null ? stack.getLastAnalyzedAt().toString() : null
            );
        }
        return new UserProfileResponse(
                user.getId().toString(),
                user.getGithubLogin(),
                user.getGithubName(),
                user.getGithubAvatar(),
                user.getEmail(),
                stackDto
        );
    }

    public record StackProfileDto(
            List<LanguageWeight> primaryLanguages,
            List<FrameworkEntry> frameworks,
            List<String> domains,
            String activityPattern,
            String intent,
            int totalRepos,
            int totalStarsGiven,
            String lastAnalyzedAt
    ) {}
}
