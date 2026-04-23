package dev.stackmatch.feedback.domain.entity;

import dev.stackmatch.feedback.domain.enums.SignalType;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "feedback_signals")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackSignal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "repo_id", nullable = false)
    private UUID repoId;

    @Column(name = "session_id")
    private UUID sessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "signal", nullable = false)
    private SignalType signal;

    @Column(name = "rank_position")
    private Integer rankPosition;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }
}
