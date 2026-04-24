package dev.stackmatch.userprofile.controller;

import dev.stackmatch.userprofile.dto.AuthResponse;
import dev.stackmatch.userprofile.dto.IntentRequest;
import dev.stackmatch.userprofile.dto.UserProfileResponse;
import dev.stackmatch.userprofile.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/api/v1/me/intent")
    public ResponseEntity<Void> setIntent(
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody IntentRequest request) {
        authService.setUserIntent(userId, request.intent());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/v1/me/stack")
    public ResponseEntity<UserProfileResponse> getMyStack(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(authService.getUserStackProfile(userId));
    }

    @PostMapping("/api/v1/me/analyze")
    public ResponseEntity<Void> triggerReanalysis(
            @AuthenticationPrincipal String userId) {
        authService.triggerStackAnalysis(userId);
        return ResponseEntity.accepted().build();
    }

    @GetMapping("/api/v1/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(
            @AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(authService.getUserStackProfile(userId));
    }
}
