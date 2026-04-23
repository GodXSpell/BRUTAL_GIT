package dev.stackmatch.userprofile.dto;

public record AuthResponse(
        String token,
        String userId,
        String githubLogin,
        String githubName,
        String githubAvatar,
        boolean isNewUser
) {}
