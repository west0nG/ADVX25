from sqlalchemy.ext.asyncio import create_async_engine
from app.config import DATABASE_URL
from app.models.bar import Bar, Base as BarBase
from app.models.recipe import Recipe, Base as RecipeBase
import asyncio

async def init_db():
    """初始化数据库，创建表结构"""
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        # 创建所有表
        await conn.run_sync(BarBase.metadata.create_all)
        await conn.run_sync(RecipeBase.metadata.create_all)
    await engine.dispose()

async def reset_db():
    """删除所有表并重新创建"""
    engine = create_async_engine(DATABASE_URL, echo=True)
    async with engine.begin() as conn:
        # 删除所有表
        await conn.run_sync(BarBase.metadata.drop_all)
        await conn.run_sync(RecipeBase.metadata.drop_all)
        # 重新创建所有表
        await conn.run_sync(BarBase.metadata.create_all)
        await conn.run_sync(RecipeBase.metadata.create_all)
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_db()) 