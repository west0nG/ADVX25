from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    buyer = Column(String, nullable=False, index=True)
    seller = Column(String, nullable=False, index=True)
    recipe_address = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False) 