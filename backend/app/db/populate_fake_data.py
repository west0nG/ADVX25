import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL
from app.models.bar import Bar, Base as BarBase
from app.models.recipe import Recipe, Base as RecipeBase
from faker import Faker
import random
import json

fake = Faker()

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def create_fake_bars(session, n=100):
    bars = []
    for _ in range(n):
        bar = Bar(
            bar_photo=fake.image_url(),
            bar_name=fake.company(),
            bar_location=fake.address(),
            bar_intro=fake.text(max_nb_chars=200),
            owner_address='0x' + ''.join(random.choices('0123456789abcdef', k=40)),
            owned_recipes=json.dumps([fake.word() for _ in range(random.randint(0, 3))]),
            used_recipes=json.dumps([fake.word() for _ in range(random.randint(0, 3))]),
        )
        bars.append(bar)
    session.add_all(bars)
    await session.flush()

async def create_fake_recipes(session, n=100):
    recipes = []
    for _ in range(n):
        recipe = Recipe(
            cocktail_name=fake.word().capitalize() + ' Cocktail',
            cocktail_intro=fake.text(max_nb_chars=150),
            cocktail_photo=fake.image_url(),
            cocktail_recipe=fake.text(max_nb_chars=300),
            recipe_photo=fake.image_url(),
            owner_address='0x' + ''.join(random.choices('0123456789abcdef', k=40)),
            user_address=json.dumps(['0x' + ''.join(random.choices('0123456789abcdef', k=40)) for _ in range(random.randint(0, 3))]),
            price=round(random.uniform(5, 100), 2),
            status=random.choice(['listed', 'unlisted', 'sold']),
        )
        recipes.append(recipe)
    session.add_all(recipes)
    await session.flush()

async def main():
    async with AsyncSessionLocal() as session:
        await create_fake_bars(session, 100)
        await create_fake_recipes(session, 100)
        await session.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main()) 