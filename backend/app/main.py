from fastapi import FastAPI

app = FastAPI(title="Bars Help Bars Backend API")

# 路由导入
from app.api import bars, recipes

app.include_router(bars.router, prefix="/api/bars", tags=["Bars"])
app.include_router(recipes.router, prefix="/api/recipes", tags=["Recipes"])

@app.get("/")
def root():
    return {"BNB Running"}
