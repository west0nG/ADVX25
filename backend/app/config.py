import os

POSTGRES_USER = os.getenv("POSTGRES_USER", "bars")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "bars123")
POSTGRES_DB = os.getenv("POSTGRES_DB", "barsdb")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = (
    f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)
