from fastapi import FastAPI

app = FastAPI(title="Bars Help Bars Backend API")

# 路由导入
from app.api.v1 import nft, user

app.include_router(nft.router, prefix="/api/v1/nfts", tags=["NFT"])
app.include_router(user.router, prefix="/api/v1/users", tags=["User"])

@app.get("/")
def root():
    return {"msg": "Bars Help Bars Backend is running!"}
