package dev.stackmatch.userprofile.repository;

import dev.stackmatch.userprofile.domain.entity.UserStackProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserStackProfileRepository extends JpaRepository<UserStackProfile, UUID> {
    Optional<UserStackProfile> findByUserId(UUID userId);
    boolean existsByUserId(UUID userId);
}
