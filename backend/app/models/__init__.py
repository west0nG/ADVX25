from app.models.bar import Bar, Base as BarBase
from app.models.recipe import Recipe, Base as RecipeBase
from app.models.transaction import Transaction, Base as TransactionBase

Base = BarBase  # 只需一个Base即可
