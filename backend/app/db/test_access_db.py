from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..models.bar import Bar
from . import session as db_session

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, for testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def get_db():
    async with db_session.AsyncSessionLocal() as session:
        yield session

@app.get("/test/bars/")
async def read_bars(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bar))
    bars = result.scalars().all()
    # Remove SQLAlchemy state from __dict__ for clean JSON
    return [
        {k: v for k, v in bar.__dict__.items() if not k.startswith('_')}
        for bar in bars
    ] 