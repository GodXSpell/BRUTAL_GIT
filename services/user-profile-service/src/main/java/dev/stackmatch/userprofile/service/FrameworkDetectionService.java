package dev.stackmatch.userprofile.service;

import dev.stackmatch.userprofile.client.GitHubApiClient;
import dev.stackmatch.userprofile.domain.entity.UserStackProfile.FrameworkEntry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class FrameworkDetectionService {

    private final GitHubApiClient gitHubApiClient;

    private static final Map<String, List<FrameworkPattern>> DETECTION_RULES = Map.of(
        "pom.xml", List.of(
            new FrameworkPattern(Pattern.compile("spring-boot"), "Spring Boot", 0.95),
            new FrameworkPattern(Pattern.compile("spring-data-jpa|hibernate"), "Hibernate/JPA", 0.9),
            new FrameworkPattern(Pattern.compile("spring-security"), "Spring Security", 0.9),
            new FrameworkPattern(Pattern.compile("spring-kafka"), "Apache Kafka", 0.85),
            new FrameworkPattern(Pattern.compile("quarkus"), "Quarkus", 0.95)
        ),
        "requirements.txt", List.of(
            new FrameworkPattern(Pattern.compile("torch|pytorch"), "PyTorch", 0.95),
            new FrameworkPattern(Pattern.compile("tensorflow"), "TensorFlow", 0.95),
            new FrameworkPattern(Pattern.compile("fastapi"), "FastAPI", 0.9),
            new FrameworkPattern(Pattern.compile("flask"), "Flask", 0.9),
            new FrameworkPattern(Pattern.compile("django"), "Django", 0.9),
            new FrameworkPattern(Pattern.compile("numpy|pandas|scikit"), "Data Science Stack", 0.85)
        ),
        "package.json", List.of(
            new FrameworkPattern(Pattern.compile("\"next\""), "Next.js", 0.95),
            new FrameworkPattern(Pattern.compile("\"react\""), "React", 0.9),
            new FrameworkPattern(Pattern.compile("\"vue\""), "Vue.js", 0.9),
            new FrameworkPattern(Pattern.compile("\"express\""), "Express.js", 0.9),
            new FrameworkPattern(Pattern.compile("\"nestjs\""), "NestJS", 0.9)
        ),
        "build.gradle", List.of(
            new FrameworkPattern(Pattern.compile("spring-boot"), "Spring Boot", 0.95),
            new FrameworkPattern(Pattern.compile("android"), "Android", 0.95)
        )
    );

    public List<FrameworkEntry> detectFromRepo(String fullName, String accessToken) {
        List<FrameworkEntry> results = new ArrayList<>();
        for (var entry : DETECTION_RULES.entrySet()) {
            String filePath = entry.getKey();
            try {
                String content = gitHubApiClient.fetchFileContent(fullName, filePath, accessToken);
                if (content == null || content.isBlank()) continue;
                for (var rule : entry.getValue()) {
                    if (rule.pattern().matcher(content.toLowerCase()).find()) {
                        results.add(new FrameworkEntry(rule.frameworkName(), filePath, rule.confidence()));
                    }
                }
            } catch (Exception e) {
                // File doesn't exist — expected
            }
        }
        return results;
    }

    private record FrameworkPattern(Pattern pattern, String frameworkName, double confidence) {}
}
