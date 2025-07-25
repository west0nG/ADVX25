from sqlalchemy.ext.asyncio import create_async_engine
from app.config import DATABASE_URL
from app.models.bar import Bar, Base as BarBase
from app.models.recipe import Recipe, Base as RecipeBase
import asyncio

async def init_db():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        # 创建所有表
        await conn.run_sync(BarBase.metadata.create_all)
        await conn.run_sync(RecipeBase.metadata.create_all)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db()) 