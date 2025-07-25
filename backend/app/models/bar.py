from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Bar(Base):
    __tablename__ = 'bars'
    id = Column(Integer, primary_key=True, autoincrement=True)
    bar_photo = Column(String, nullable=False)  # IPFS CID或URL
    bar_name = Column(String, nullable=False)
    bar_location = Column(String, nullable=False)
    bar_intro = Column(String, nullable=True)
    owner_address = Column(String, nullable=False, index=True) 
    owned_recipes = Column(String[999], nullable=True)
    used_recipes = Column(String[999], nullable=True)
    