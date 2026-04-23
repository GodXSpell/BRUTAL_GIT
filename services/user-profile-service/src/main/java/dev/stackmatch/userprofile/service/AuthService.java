package dev.stackmatch.userprofile.service;

import dev.stackmatch.userprofile.domain.entity.User;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile;
import dev.stackmatch.userprofile.domain.enums.UserIntent;
import dev.stackmatch.userprofile.dto.AuthResponse;
import dev.stackmatch.userprofile.dto.UserProfileResponse;
import dev.stackmatch.userprofile.event.UserProfileCreatedEvent;
import dev.stackmatch.userprofile.repository.UserRepository;
import dev.stackmatch.userprofile.repository.UserStackProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final UserStackProfileRepository stackProfileRepository;
    private final JwtService jwtService;
    private final GitHubAnalysisService analysisService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Transactional
    public AuthResponse handleOAuthCallback(OAuth2User oAuth2User) {
        Map<String, Object> attrs = oAuth2User.getAttributes();

        Long githubId = ((Number) attrs.get("id")).longValue();
        String login = (String) attrs.get("login");
        String name = (String) attrs.get("name");
        String avatar = (String) attrs.get("avatar_url");
        String email = (String) attrs.get("email");

        // Upsert user
        User user = userRepository.findByGithubId(githubId)
                .map(existing -> {
                    existing.setGithubLogin(login);
                    existing.setGithubName(name);
                    existing.setGithubAvatar(avatar);
                    existing.setEmail(email);
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .githubId(githubId)
                            .githubLogin(login)
                            .githubName(name)
                            .githubAvatar(avatar)
                            .email(email)
                            .accessToken("placeholder") // Will be set from OAuth token
                            .build();
                    User saved = userRepository.save(newUser);

                    // Publish creation event
                    kafkaTemplate.send("user.profile.created", saved.getId().toString(),
                            new UserProfileCreatedEvent(
                                    saved.getId().toString(),
                                    login,
                                    Instant.now()
                            ));

                    return saved;
                });

        // Generate JWT
        String jwt = jwtService.generateToken(user.getId().toString(), user.getGithubLogin());

        // Trigger async stack analysis for new users
        if (!stackProfileRepository.existsByUserId(user.getId())) {
            triggerStackAnalysis(user.getId().toString());
        }

        boolean isNewUser = !stackProfileRepository.existsByUserId(user.getId());

        return new AuthResponse(
                jwt,
                user.getId().toString(),
                user.getGithubLogin(),
                user.getGithubName(),
                user.getGithubAvatar(),
                isNewUser
        );
    }

    @Async
    public void triggerStackAnalysis(String userId) {
        try {
            UUID uid = UUID.fromString(userId);
            User user = userRepository.findById(uid)
                    .orElseThrow(() -> new RuntimeException("User not found: " + userId));

            log.info("Triggering stack analysis for user: {}", user.getGithubLogin());

            UserStackProfile profile = analysisService.analyzeUser(
                    user.getGithubLogin(), user.getAccessToken()
            );

            // Link profile to user and persist
            profile.setUser(user);
            profile.setLastAnalyzedAt(Instant.now());

            stackProfileRepository.findByUserId(uid)
                    .ifPresentOrElse(
                            existing -> {
                                existing.setPrimaryLanguages(profile.getPrimaryLanguages());
                                existing.setFrameworks(profile.getFrameworks());
                                existing.setDomains(profile.getDomains());
                                existing.setActivityPattern(profile.getActivityPattern());
                                existing.setTotalRepos(profile.getTotalRepos());
                                existing.setTotalStarsGiven(profile.getTotalStarsGiven());
                                existing.setLastAnalyzedAt(Instant.now());
                                stackProfileRepository.save(existing);
                            },
                            () -> stackProfileRepository.save(profile)
                    );

            log.info("Stack analysis complete for user: {}", user.getGithubLogin());
        } catch (Exception e) {
            log.error("Failed to analyze stack for user {}: {}", userId, e.getMessage(), e);
        }
    }

    @Transactional
    public void setUserIntent(String userId, UserIntent intent) {
        UUID uid = UUID.fromString(userId);
        UserStackProfile profile = stackProfileRepository.findByUserId(uid)
                .orElseThrow(() -> new RuntimeException("Stack profile not found for user: " + userId));
        profile.setIntent(intent);
        stackProfileRepository.save(profile);

        kafkaTemplate.send("user.profile.updated", userId,
                Map.of("userId", userId, "intent", intent.name(), "timestamp", Instant.now().toString()));
    }

    public UserProfileResponse getUserStackProfile(String userId) {
        UUID uid = UUID.fromString(userId);
        User user = userRepository.findById(uid)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        UserStackProfile stack = stackProfileRepository.findByUserId(uid).orElse(null);

        return UserProfileResponse.from(user, stack);
    }
}
