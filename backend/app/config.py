import os
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

# 数据库配置
POSTGRES_USER = os.getenv("POSTGRES_USER", "bars")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "bars123")
POSTGRES_DB = os.getenv("POSTGRES_DB", "barsdb")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = (
    f"postgresql+asyncpg://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
)

# IPFS 配置 (Pinata)
PINATA_JWT = os.getenv("PINATA_JWT")
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")

# 其他配置
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
