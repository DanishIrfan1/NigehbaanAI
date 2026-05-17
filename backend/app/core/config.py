"""Application configuration loaded from environment / .env file."""

# pyrefly: ignore [missing-import]
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    APP_NAME: str = "NigehbaanAI"
    DEBUG: bool = False

    # Gemini / Antigravity
    GOOGLE_API_KEY: str = ""

    # Simulated external APIs (replace with real keys when available)
    WEATHER_API_KEY: str = "MOCK_WEATHER_KEY"
    TRAFFIC_API_KEY: str = "MOCK_TRAFFIC_KEY"
    SOCIAL_API_KEY: str = "MOCK_SOCIAL_KEY"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000


settings = Settings()
