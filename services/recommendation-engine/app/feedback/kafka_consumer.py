import asyncio
import json
import os
import structlog
from kafka import KafkaConsumer
from app.feedback.online_learner import OnlineEmbeddingUpdater
from app.db.connection import get_db_pool

log = structlog.get_logger()


async def start_feedback_consumer():
    """
    Long-running Kafka consumer.
    Listens on feedback.embedding.update and triggers online learning.
    """
    db_pool = await get_db_pool()
    updater = OnlineEmbeddingUpdater(db_pool)

    bootstrap = os.getenv("KAFKA_BOOTSTRAP", "kafka:29092")

    consumer = KafkaConsumer(
        "feedback.embedding.update",
        bootstrap_servers=[bootstrap],
        group_id="recommendation-engine-feedback",
        auto_offset_reset="earliest",
        value_deserializer=lambda v: json.loads(v.decode("utf-8")),
        enable_auto_commit=True,
    )

    log.info("Feedback consumer started, listening on feedback.embedding.update")

    for message in consumer:
        try:
            event = message.value
            user_id = event["userId"]
            liked_repos = event.get("likedRepoIds", [])
            disliked_repos = event.get("dislikedRepoIds", [])

            log.info("Processing embedding update",
                     user_id=user_id,
                     liked=len(liked_repos),
                     disliked=len(disliked_repos))

            await updater.update_user_embedding(user_id, liked_repos, disliked_repos)

        except Exception as e:
            log.error("Failed to process feedback event",
                      error=str(e), message=message.value)
