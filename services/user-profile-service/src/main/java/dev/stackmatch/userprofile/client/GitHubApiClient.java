package dev.stackmatch.userprofile.client;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@Slf4j
public class GitHubApiClient {

    @Value("${app.github.api-base}")
    private String apiBase;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<RepoDto> fetchUserRepos(String login, String accessToken) {
        List<RepoDto> allRepos = new ArrayList<>();
        int page = 1;
        int perPage = 100;

        while (true) {
            String url = String.format("%s/users/%s/repos?per_page=%d&page=%d&sort=pushed&type=all",
                    apiBase, login, perPage, page);

            ResponseEntity<RepoDto[]> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    createEntity(accessToken),
                    RepoDto[].class);

            if (response.getBody() == null || response.getBody().length == 0)
                break;

            allRepos.addAll(Arrays.asList(response.getBody()));

            if (response.getBody().length < perPage)
                break;
            page++;

            // Safety limit
            if (page > 10)
                break;
        }

        log.info("Fetched {} repos for user {}", allRepos.size(), login);
        return allRepos;
    }

    // @SuppressWarnings("unchecked")
    public Map<String, Long> fetchRepoLanguages(String fullName, String accessToken) {
        try {
            String url = String.format("%s/repos/%s/languages", apiBase, fullName);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    url, HttpMethod.GET, createEntity(accessToken),
                    new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {
                    });
            Map<String, Object> body = response.getBody();
            if (body == null)
                return Collections.emptyMap();

            Map<String, Long> result = new HashMap<>();
            body.forEach((key, value) -> {
                if (value instanceof Number) {
                    result.put(key, ((Number) value).longValue());
                }
            });
            return result;
        } catch (Exception e) {
            log.debug("Failed to fetch languages for {}: {}", fullName, e.getMessage());
            return Collections.emptyMap();
        }
    }

    public String fetchFileContent(String fullName, String filePath, String accessToken) {
        try {
            String url = String.format("%s/repos/%s/contents/%s", apiBase, fullName, filePath);
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.set("Accept", "application/vnd.github.raw+json");

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, new HttpEntity<>(headers), String.class);
            return response.getBody();
        } catch (Exception e) {
            return null; // File doesn't exist — expected
        }
    }

    public int fetchStarredCount(String login, String accessToken) {
        try {
            String url = String.format("%s/users/%s/starred?per_page=1", apiBase, login);
            ResponseEntity<Object[]> response = restTemplate.exchange(
                    url, HttpMethod.GET, createEntity(accessToken), Object[].class);

            // Parse Link header for total count
            String linkHeader = response.getHeaders().getFirst("Link");
            if (linkHeader != null && linkHeader.contains("last")) {
                String lastPage = linkHeader.substring(linkHeader.lastIndexOf("page=") + 5);
                lastPage = lastPage.substring(0, lastPage.indexOf(">"));
                return Integer.parseInt(lastPage);
            }
            return response.getBody() != null ? response.getBody().length : 0;
        } catch (Exception e) {
            log.debug("Failed to fetch starred count for {}: {}", login, e.getMessage());
            return 0;
        }
    }

    private HttpEntity<?> createEntity(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("Accept", "application/vnd.github+json");
        headers.set("X-GitHub-Api-Version", "2022-11-28");
        return new HttpEntity<>(headers);
    }

    @Data
    public static class RepoDto {
        private Long id;
        private String name;
        private String full_name;
        private String description;
        private String html_url;
        private String homepage;
        private List<String> topics;
        private String language;
        private int stargazers_count;
        private int forks_count;
        private int open_issues_count;
        private int watchers_count;
        private boolean fork;
        private boolean archived;
        private String pushed_at;
        private String created_at;
        private Map<String, Object> license;

        public String getFullName() {
            return full_name;
        }

        public boolean isFork() {
            return fork;
        }

        public boolean isArchived() {
            return archived;
        }
    }
}
