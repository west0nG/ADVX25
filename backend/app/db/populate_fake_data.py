import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL
from app.models.bar import Bar, Base as BarBase
from app.models.recipe import Recipe, Base as RecipeBase
from app.models.transaction import Transaction, Base as TransactionBase
from faker import Faker
import random
import json
from datetime import datetime, timedelta

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
            bar_address='0x' + ''.join(random.choices('0123456789abcdef', k=40)),
            owned_recipes=json.dumps([fake.word() for _ in range(random.randint(0, 3))]),
            used_recipes=json.dumps([fake.word() for _ in range(random.randint(0, 3))]),
        )
        bars.append(bar)
    session.add_all(bars)
    await session.flush()
    return bars

async def create_fake_recipes(session, n=100, bar_addresses=None):
    recipes = []
    for _ in range(n):
        owner = random.choice(bar_addresses) if bar_addresses else '0x' + ''.join(random.choices('0123456789abcdef', k=40))
        recipe = Recipe(
            cocktail_name=fake.word().capitalize() + ' Cocktail',
            cocktail_intro=fake.text(max_nb_chars=150),
            cocktail_photo=fake.image_url(),
            cocktail_recipe=fake.text(max_nb_chars=300),
            recipe_photo=fake.image_url(),
            owner_address=owner,
            user_address=json.dumps(['0x' + ''.join(random.choices('0123456789abcdef', k=40)) for _ in range(random.randint(0, 3))]),
            price=round(random.uniform(5, 100), 2),
            status=random.choice(['listed', 'unlisted', 'sold']),
            recipe_address='0x' + ''.join(random.choices('0123456789abcdef', k=40)),
        )
        recipes.append(recipe)
    session.add_all(recipes)
    await session.flush()
    return recipes

async def create_fake_transactions(session, n=200, bars=None, recipes=None):
    transactions = []
    if not bars or not recipes:
        return transactions
    bar_addresses = [bar.bar_address for bar in bars]
    recipe_objs = recipes
    for _ in range(n):
        recipe = random.choice(recipe_objs)
        seller = recipe.owner_address
        # buyer不能和seller一样
        buyer = random.choice([addr for addr in bar_addresses if addr != seller]) if len(bar_addresses) > 1 else seller
        # 随机时间
        days_ago = random.randint(0, 365)
        tx_time = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        transaction = Transaction(
            buyer=buyer,
            seller=seller,
            recipe_address=recipe.recipe_address,
            timestamp=tx_time
        )
        transactions.append(transaction)
    session.add_all(transactions)
    await session.flush()
    return transactions

async def main():
    async with AsyncSessionLocal() as session:
        bars = await create_fake_bars(session, 100)
        bar_addresses = [bar.bar_address for bar in bars]
        recipes = await create_fake_recipes(session, 100, bar_addresses=bar_addresses)
        await create_fake_transactions(session, 200, bars=bars, recipes=recipes)
        await session.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main()) 