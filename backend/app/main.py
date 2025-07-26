from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os

app = FastAPI(title="Bars Help Bars Backend API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # React default port
        "http://localhost:8000",      # Vue default port
        "http://localhost:4200",      # Angular default port
        "http://localhost:5173",      # Vite default port
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:5173",
        "http://localhost:5500",      # Live Server default port
        "http://127.0.0.1:5500",
        "*"  # Allow all origins (for development - remove in production)
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

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
