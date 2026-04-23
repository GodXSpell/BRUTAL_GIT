from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://stackmatch:stackmatch_secret@localhost:5432/stackmatch"
    elasticsearch_url: str = "http://localhost:9200"
    redis_url: str = "redis://localhost:6379"
    kafka_bootstrap: str = "localhost:9092"
    otel_endpoint: str = "http://otel-collector:4317"

    class Config:
        env_file = ".env"


settings = Settings()
