package dev.stackmatch.feedback.controller;

import dev.stackmatch.feedback.dto.FeedbackRequest;
import dev.stackmatch.feedback.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> recordFeedback(
            @RequestHeader("X-User-Id") String userId,
            @Valid @RequestBody FeedbackRequest request) {
        feedbackService.recordFeedback(UUID.fromString(userId), request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "embeddingUpdated", false
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<?> getFeedbackHistory(
            @RequestParam String userId) {
        var history = feedbackService.getUserFeedbackHistory(UUID.fromString(userId));
        return ResponseEntity.ok(history);
    }
}
