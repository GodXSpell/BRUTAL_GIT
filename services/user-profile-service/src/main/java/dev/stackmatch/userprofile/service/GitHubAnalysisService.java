package dev.stackmatch.userprofile.service;

import dev.stackmatch.userprofile.client.GitHubApiClient;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile.FrameworkEntry;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile.LanguageWeight;
import dev.stackmatch.userprofile.domain.enums.ActivityPattern;
import dev.stackmatch.userprofile.event.UserStackAnalyzedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GitHubAnalysisService {

    private final GitHubApiClient gitHubApiClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final FrameworkDetectionService frameworkDetector;

    private static final Map<String, String> LANGUAGE_DOMAIN_MAP = Map.ofEntries(
        Map.entry("Python", "data-science"),
        Map.entry("R", "data-science"),
        Map.entry("Java", "web-backend"),
        Map.entry("Kotlin", "web-backend"),
        Map.entry("JavaScript", "web-frontend"),
        Map.entry("TypeScript", "web-frontend"),
        Map.entry("Go", "systems"),
        Map.entry("Rust", "systems"),
        Map.entry("C", "systems"),
        Map.entry("C++", "systems")
    );

    public UserStackProfile analyzeUser(String githubLogin, String accessToken) {
        log.info("Starting GitHub analysis for user: {}", githubLogin);

        // 1. Fetch all public repos (paginated)
        var repos = gitHubApiClient.fetchUserRepos(githubLogin, accessToken);

        // 2. Aggregate language bytes across all repos
        Map<String, Long> aggregatedLanguages = new HashMap<>();
        for (var repo : repos) {
            if (repo.isFork()) continue;
            var langs = gitHubApiClient.fetchRepoLanguages(repo.getFullName(), accessToken);
            langs.forEach((lang, bytes) ->
                    aggregatedLanguages.merge(lang, bytes, Long::sum));
        }

        // 3. Compute language weights
        long totalBytes = aggregatedLanguages.values().stream().mapToLong(v -> v).sum();
        List<LanguageWeight> languageWeights = aggregatedLanguages.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> new LanguageWeight(e.getKey(),
                        totalBytes > 0 ? (double) e.getValue() / totalBytes * 100.0 : 0.0))
                .collect(Collectors.toList());

        // 4. Detect frameworks from dependency files
        List<FrameworkEntry> frameworks = new ArrayList<>();
        for (var repo : repos.subList(0, Math.min(repos.size(), 20))) {
            var detected = frameworkDetector.detectFromRepo(repo.getFullName(), accessToken);
            frameworks.addAll(detected);
        }

        // Deduplicate frameworks, keep highest confidence
        Map<String, FrameworkEntry> uniqueFrameworks = new LinkedHashMap<>();
        for (var fw : frameworks) {
            uniqueFrameworks.merge(fw.name(), fw,
                    (a, b) -> a.confidence() >= b.confidence() ? a : b);
        }

        // 5. Infer domains from top languages
        Set<String> domains = languageWeights.stream()
                .limit(3)
                .map(lw -> LANGUAGE_DOMAIN_MAP.getOrDefault(lw.name(), "general"))
                .collect(Collectors.toSet());

        // 6. Detect activity pattern
        var activityPattern = detectActivityPattern(repos);

        // 7. Fetch starred repos count
        int starsGiven = gitHubApiClient.fetchStarredCount(githubLogin, accessToken);

        // 8. Build profile
        var profile = UserStackProfile.builder()
                .primaryLanguages(languageWeights)
                .frameworks(new ArrayList<>(uniqueFrameworks.values()))
                .domains(new ArrayList<>(domains))
                .activityPattern(activityPattern)
                .totalRepos(repos.size())
                .totalStarsGiven(starsGiven)
                .build();

        // 9. Publish event for embedding computation
        kafkaTemplate.send("user.stack.analyzed", githubLogin,
                new UserStackAnalyzedEvent(githubLogin, profile));

        log.info("Analysis complete for {} — {} languages, {} frameworks",
                githubLogin, languageWeights.size(), uniqueFrameworks.size());

        return profile;
    }

    private ActivityPattern detectActivityPattern(List<GitHubApiClient.RepoDto> repos) {
        long ownedRepos = repos.stream().filter(r -> !r.isFork()).count();
        long forkedRepos = repos.stream().filter(GitHubApiClient.RepoDto::isFork).count();

        if (forkedRepos > ownedRepos * 0.5) {
            return ActivityPattern.CONTRIBUTOR;
        } else if (ownedRepos > 10) {
            return ActivityPattern.BUILDER;
        }
        return ActivityPattern.LEARNER;
    }
}
