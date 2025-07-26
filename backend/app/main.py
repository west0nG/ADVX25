from fastapi import FastAPI
import asyncio
import os

app = FastAPI(title="Bars Help Bars Backend API")

# 路由导入
from app.api import bars, recipes, trans_and_mint

app.include_router(bars.router, prefix="/api/bars", tags=["Bars"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["Recipes"])
app.include_router(trans_and_mint.router, prefix="/api/trans", tags=["Transactions & Mint"])

@app.on_event("startup")
async def startup_event():
    if os.getenv("INIT_DB_ON_STARTUP", "true").lower() == "true":
        from app.db.init_db import reset_db
        from app.db.populate_fake_data import main
        await reset_db()  # 删除所有表并重新创建
        await main()  # 注入假数据

@app.get("/")
def root():
    return {"BNB Running"}
