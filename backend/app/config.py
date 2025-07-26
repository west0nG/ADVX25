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
# PINATA_API_KEY = os.getenv("PINATA_API_KEY")
# PINATA_API_SECRET = os.getenv("PINATA_API_SECRET")
PINATA_API_KEY = "5518994785523439e146"
PINATA_API_SECRET = "1b3a034a58f5622b350fbd8e22fe6e7bb8bc8a501387ded59773e595718756fc"

# 其他配置
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
