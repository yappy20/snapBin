"""Application settings, loaded from environment variables / .env.

Defaults are chosen to work two ways with zero config changes:
  - Local dev: files land under ./data and ./static/uploads next to the code.
  - Railway/PaaS: set DATA_DIR to your mounted volume's path (e.g. /app/data)
    and everything (the SQLite file + uploaded photos) persists across deploys.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # AI vision provider
    ai_provider: str = "anthropic"  # "anthropic" | "openai" | "none"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-5"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # Enrichment
    mouser_api_key: str = ""

    # Security
    capture_api_key: str = "change-me"

    # Persistent storage root. On Railway this should be your volume's mount
    # path (e.g. /app/data); locally it defaults to ./data.
    data_dir: str = "./data"

    # Database — defaults to a file under data_dir unless overridden outright.
    database_url: str = ""

    # Uploads — defaults to a folder under data_dir unless overridden outright.
    upload_dir: str = ""

    # CORS (only relevant if you ever split the frontend back out to its own origin)
    cors_origins: str = "http://localhost:5173,http://localhost:8080"

    # Railway (and most PaaS) inject PORT; default matches local dev.
    port: int = 8000

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def resolved_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return f"sqlite:///{self.data_dir.rstrip('/')}/snapbin.db"

    @property
    def resolved_upload_dir(self) -> str:
        if self.upload_dir:
            return self.upload_dir
        return f"{self.data_dir.rstrip('/')}/uploads"


@lru_cache
def get_settings() -> Settings:
    return Settings()
