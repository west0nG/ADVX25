from fastapi import FastAPI
import asyncio
import os

app = FastAPI(title="Bars Help Bars Backend API")

# 路由导入
from app.api import bars, recipes

app.include_router(bars.router, prefix="/api/bars", tags=["Bars"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["Recipes"])

@app.on_event("startup")
async def startup_event():
    if os.getenv("INIT_DB_ON_STARTUP", "true").lower() == "true":
        from app.db.init_db import init_db
        from app.db.populate_fake_data import main
        await init_db()
        await main()

@app.get("/")
def root():
    return {"BNB Running"}
