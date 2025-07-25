from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class NFT(Base):
    __tablename__ = 'nfts'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    image_cid = Column(String)  # IPFS CID
    owner = Column(String, index=True)
    # 其他字段...
