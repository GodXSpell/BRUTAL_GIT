package dev.stackmatch.userprofile.domain.entity;

import dev.stackmatch.userprofile.domain.enums.ActivityPattern;
import dev.stackmatch.userprofile.domain.enums.UserIntent;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "user_stack_profiles")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStackProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "primary_languages", columnDefinition = "jsonb")
    private List<LanguageWeight> primaryLanguages;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "frameworks", columnDefinition = "jsonb")
    private List<FrameworkEntry> frameworks;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "domains", columnDefinition = "jsonb")
    private List<String> domains;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_pattern")
    private ActivityPattern activityPattern;

    @Enumerated(EnumType.STRING)
    @Column(name = "intent")
    private UserIntent intent;

    @Column(name = "total_repos")
    private Integer totalRepos;

    @Column(name = "total_stars_given")
    private Integer totalStarsGiven;

    @Column(name = "profile_embedding", columnDefinition = "vector(128)")
    private float[] profileEmbedding;

    @Column(name = "last_analyzed_at")
    private Instant lastAnalyzedAt;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // Nested value objects for JSONB columns
    public record LanguageWeight(String name, double weightPct) {}
    public record FrameworkEntry(String name, String source, double confidence) {}
}
