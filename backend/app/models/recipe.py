from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Recipe(Base):
    __tablename__ = 'recipes'
    id = Column(Integer, primary_key=True, autoincrement=True)
    cocktail_name = Column(String, nullable=False)
    cocktail_intro = Column(String, nullable=True)
    cocktail_photo = Column(String, nullable=False)  # IPFS CID或URL
    cocktail_recipe = Column(String, nullable=True)  # 私有字段
    recipe_photo = Column(String, nullable=True)     # 私有字段
    owner_address = Column(String, nullable=False, index=True)
    user_address = Column(String[999], nullable=True)  # JSON-encoded list of strings
    price = Column(Float, nullable=True)
    status = Column(String, nullable=True)  # 上架/未上架/已售等 
