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

async def create_fake_bars(session, n=5):
    # Load real bar data from JSON file
    with open('app/db/bars_fake_data.json', 'r', encoding='utf-8') as f:
        bars_data = json.load(f)
    
    bars = []
    for bar_data in bars_data:
        bar = Bar(
            bar_photo=bar_data['bar_photo'],
            bar_name=bar_data['bar_name'],
            bar_location=bar_data['bar_location'],
            bar_intro=bar_data['bar_intro'],
            bar_address=bar_data['bar_address'],
            owned_recipes=json.dumps(bar_data['owned_recipes']),
            used_recipes=json.dumps(bar_data['used_recipes']),
        )
        bars.append(bar)
    session.add_all(bars)
    await session.flush()
    return bars

async def create_fake_recipes(session, n=10, bar_addresses=None):
    # Load real recipe data from JSON file
    with open('app/db/recipes_fake_data.json', 'r', encoding='utf-8') as f:
        recipes_data = json.load(f)
    
    recipes = []
    for recipe_data in recipes_data:
        recipe = Recipe(
            cocktail_name=recipe_data['cocktail_name'],
            cocktail_intro=recipe_data['cocktail_intro'],
            cocktail_photo=recipe_data['cocktail_photo'],
            cocktail_recipe=recipe_data['cocktail_recipe'],
            recipe_photo=recipe_data['recipe_photo'],
            owner_address=recipe_data['owner_address'],
            user_address=json.dumps(recipe_data['user_address']),
            price=recipe_data['price'],
            status=recipe_data['status'],
            recipe_address=recipe_data['recipe_address'],
        )
        recipes.append(recipe)
    session.add_all(recipes)
    await session.flush()
    return recipes

async def create_fake_transactions(session, n=15, bars=None, recipes=None):
    # Load real transaction data from JSON file
    with open('app/db/transactions_fake_data.json', 'r', encoding='utf-8') as f:
        transactions_data = json.load(f)
    
    transactions = []
    for tx_data in transactions_data:
        # Convert timestamp string to datetime object
        days_ago = random.randint(0, 365)
        tx_time = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
        
        transaction = Transaction(
            buyer=tx_data['buyer'],
            seller=tx_data['seller'],
            recipe_address=tx_data['recipe_address'],
            timestamp=tx_time
        )
        transactions.append(transaction)
    session.add_all(transactions)
    await session.flush()
    return transactions

async def main():
    async with AsyncSessionLocal() as session:
        bars = await create_fake_bars(session, 5)  # 5 bars from JSON file
        bar_addresses = [bar.bar_address for bar in bars]
        recipes = await create_fake_recipes(session, 10, bar_addresses=bar_addresses)  # 10 recipes
        await create_fake_transactions(session, 15, bars=bars, recipes=recipes)  # 15 transactions
        await session.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main()) 