from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Optional
import json
import os
from datetime import datetime
from pydantic import BaseModel

from app.services.ipfs import upload_picture_to_pinata
from app.models.transaction import Transaction
from app.models.bar import Bar
from app.models.recipe import Recipe
from app.db.session import AsyncSessionLocal

router = APIRouter()

# Pydantic models for request validation
class CompleteTransactionRequest(BaseModel):
    recipe_nft: str
    buyer: str
    timestamp: str

class CompleteRecipeMintRequest(BaseModel):
    recipe_nft: str
    owner: str

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/upload_pic_to_ipfs")
async def upload_pic_to_ipfs(file: UploadFile = File(...)):
    """上传图片到IPFS，返回CID供前端mint使用"""
    # 验证文件格式
    if not file.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        raise HTTPException(status_code=400, detail="文件必须是JPG或PNG格式")
    
    try:
        # 保存文件到临时目录
        pics_folder = os.path.join(os.path.dirname(__file__), "..", "services", "pics")
        os.makedirs(pics_folder, exist_ok=True)
        file_path = os.path.join(pics_folder, file.filename)
        
        with open(file_path, "wb") as f:
            f.write(await file.read())
        
        # 上传到IPFS获取CID
        cid = upload_picture_to_pinata(file_path)
        
        # 清理临时文件
        os.remove(file_path)
        
        return {"cid": cid}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@router.post("/complete_transaction")
async def complete_transaction(
    request: CompleteTransactionRequest,
    db: AsyncSession = Depends(get_db)
):
    """完成交易后同步数据到后端"""
    try:
        # 1. 查找recipe的owner作为seller
        result = await db.execute(
            select(Recipe).where(Recipe.recipe_address == request.recipe_nft)
        )
        recipe = result.scalar_one_or_none()
        
        if not recipe:
            raise HTTPException(status_code=404, detail="Recipe not found")
        
        seller = recipe.owner_address
        
        # 2. 更新buyer的used_recipes
        result = await db.execute(
            select(Bar).where(Bar.bar_address == request.buyer)
        )
        buyer_bar = result.scalar_one_or_none()
        
        if buyer_bar:
            used_recipes = json.loads(buyer_bar.used_recipes) if buyer_bar.used_recipes else []
            if request.recipe_nft not in used_recipes:
                used_recipes.append(request.recipe_nft)
                buyer_bar.used_recipes = json.dumps(used_recipes)
        
        # 3. 更新recipe的user_address
        user_addresses = json.loads(recipe.user_address) if recipe.user_address else []
        if request.buyer not in user_addresses:
            user_addresses.append(request.buyer)
            recipe.user_address = json.dumps(user_addresses)
        
        # 4. 新增transaction记录
        transaction = Transaction(
            buyer=request.buyer,
            seller=seller,
            recipe_address=request.recipe_nft,
            timestamp=datetime.fromisoformat(request.timestamp)
        )
        db.add(transaction)
        
        await db.commit()
        return {"success": True}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"完成交易失败: {str(e)}")

@router.post("/complete_recipe_mint")
async def complete_recipe_mint(
    request: CompleteRecipeMintRequest,
    db: AsyncSession = Depends(get_db)
):
    """完成recipe mint后同步数据到后端"""
    try:
        # 更新owner的owned_recipes
        result = await db.execute(
            select(Bar).where(Bar.bar_address == request.owner)
        )
        owner_bar = result.scalar_one_or_none()
        
        if owner_bar:
            owned_recipes = json.loads(owner_bar.owned_recipes) if owner_bar.owned_recipes else []
            if request.recipe_nft not in owned_recipes:
                owned_recipes.append(request.recipe_nft)
                owner_bar.owned_recipes = json.dumps(owned_recipes)
                await db.commit()
        
        return {"success": True}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"完成mint失败: {str(e)}")

@router.get("/transaction_history/{address}")
async def get_transaction_history(
    address: str,
    db: AsyncSession = Depends(get_db)
):
    """获取某地址的交易历史"""
    try:
        # 查询作为buyer的交易
        result = await db.execute(
            select(Transaction).where(Transaction.buyer == address)
        )
        buyer_transactions = result.scalars().all()
        
        # 查询作为seller的交易
        result = await db.execute(
            select(Transaction).where(Transaction.seller == address)
        )
        seller_transactions = result.scalars().all()
        
        # 合并并格式化
        all_transactions = []
        for tx in buyer_transactions:
            all_transactions.append({
                "id": tx.id,
                "type": "buy",
                "counterparty": tx.seller,
                "recipe_address": tx.recipe_address,
                "timestamp": tx.timestamp.isoformat()
            })
        
        for tx in seller_transactions:
            all_transactions.append({
                "id": tx.id,
                "type": "sell",
                "counterparty": tx.buyer,
                "recipe_address": tx.recipe_address,
                "timestamp": tx.timestamp.isoformat()
            })
        
        # 按时间排序
        all_transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return all_transactions
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取交易历史失败: {str(e)}") 