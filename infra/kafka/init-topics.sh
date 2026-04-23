#!/bin/bash
set -e

KAFKA_BROKER="kafka:29092"

create_topic() {
  local topic=$1
  local partitions=${2:-3}
  local retention_ms=${3:-604800000}  # 7 days default

  kafka-topics --create \
    --bootstrap-server $KAFKA_BROKER \
    --topic $topic \
    --partitions $partitions \
    --replication-factor 1 \
    --if-not-exists \
    --config retention.ms=$retention_ms

  echo "Created topic: $topic"
}

# User lifecycle events
create_topic "user.profile.created" 3
create_topic "user.profile.updated" 3
create_topic "user.stack.analyzed" 3

# Recommendation pipeline
create_topic "recommendation.requested" 6
create_topic "recommendation.generated" 6
create_topic "recommendation.served" 3

# Feedback events
create_topic "feedback.signal" 6
create_topic "feedback.embedding.update" 3

# Ingestion pipeline
create_topic "repo.indexed" 6
create_topic "repo.embedding.computed" 3

# Analytics / dead letter
create_topic "analytics.events" 3
create_topic "dlq.failed.events" 1 2592000000  # 30 days

echo "All topics created successfully."
