from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Optional
import json
import os
import requests
from pydantic import BaseModel

from app.services.ipfs import upload_picture_to_pinata, upload_bar_to_pinata, fetch_metadata_from_ipfs
from app.models.bar import Bar
from app.db.session import AsyncSessionLocal

router = APIRouter()

# Define Pydantic models for bar data
class BarUpdateRequest(BaseModel):
    bar_address: str
    bar_name: str
    bar_photo_cid: str
    bar_location: str
    bar_intro: Optional[str] = None

class BarSetRequest(BaseModel):
    bar_address: str
    meta_cid: str

class BarResponse(BaseModel):
    bar_name: str
    bar_photo_cid: str
    bar_location: str
    bar_intro: Optional[str] = None
    owned_recipes: List[str] = []
    used_recipes: List[str] = []

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/upload_bar_ipfs")
async def upload_bar_ipfs(
    bar_name: str = Form(...),
    bar_location: str = Form(...),
    bar_intro: Optional[str] = Form(None),
    jpg_file: UploadFile = File(..., description="JPG image file")
):
    """上传酒吧Meta到IPFS，返回 CID。"""
    # 验证JPG文件
    if not jpg_file.filename.lower().endswith('.jpg'):
        raise HTTPException(status_code=400, detail="文件必须是JPG格式")
    
    try:
        # 保存JPG文件到临时目录
        pics_folder = os.path.join(os.path.dirname(__file__), "..", "services", "pics")
        os.makedirs(pics_folder, exist_ok=True)
        jpg_file_path = os.path.join(pics_folder, jpg_file.filename)
        
        with open(jpg_file_path, "wb") as f:
            f.write(await jpg_file.read())
        
        # 上传JPG到IPFS获取照片CID
        photo_cid = upload_picture_to_pinata(jpg_file_path)
        
        # 创建完整的酒吧元数据并上传
        bar_metadata_cid = upload_bar_to_pinata(
            bar_photo_cid=photo_cid,
            bar_name=bar_name,
            bar_location=bar_location,
            bar_intro=bar_intro or ""
        )
        
        return {"cid": bar_metadata_cid}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@router.get("/get/{bar_address}")
async def get_bar(
    bar_address: str,
    db: AsyncSession = Depends(get_db)
):
    """根据 Bar 地址获取酒吧信息。"""
    try:
        # 查询数据库中的Bar记录
        result = await db.execute(
            select(Bar).where(Bar.bar_address == bar_address)
        )
        bar = result.scalar_one_or_none()
        
        if not bar:
            raise HTTPException(status_code=404, detail="酒吧不存在")
        
        # 解析owned_recipes和used_recipes
        owned_recipes = json.loads(bar.owned_recipes) if bar.owned_recipes else []
        used_recipes = json.loads(bar.used_recipes) if bar.used_recipes else []

        return BarResponse(
            bar_name=bar.bar_name,
            bar_photo_cid=bar.bar_photo,
            bar_location=bar.bar_location,
            bar_intro=bar.bar_intro,
            owned_recipes=owned_recipes,
            used_recipes=used_recipes
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.post("/update")
async def update_bar(
    item: BarUpdateRequest,
    db: AsyncSession = Depends(get_db)
):
    """更新酒吧信息。如果没有就报错, 还需要做一下链上的同步"""
    try:
        # 查询现有记录
        result = await db.execute(
            select(Bar).where(Bar.bar_address == item.bar_address)
        )
        bar = result.scalar_one_or_none()
        
        if not bar:
            raise HTTPException(status_code=404, detail="酒吧不存在，无法更新")
        
        # 更新字段
        bar.bar_name = item.bar_name
        bar.bar_photo = item.bar_photo_cid
        bar.bar_location = item.bar_location
        bar.bar_intro = item.bar_intro
        
        await db.commit()
        
        # TODO: 这里需要添加链上同步逻辑
        
        return {"success": True}
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")

@router.post("/set")
async def set_bar(
    item: BarSetRequest,
    db: AsyncSession = Depends(get_db)
):
    """新建酒吧信息。如果已有报错，应该是在sign up的时候使用, 前端先从链上获得address然后再传过来一个Metadata的CID"""
    try:
        # 验证输入参数
        if not item.bar_address:
            raise HTTPException(status_code=422, detail="bar_address is required")
        if not item.meta_cid:
            raise HTTPException(status_code=422, detail="meta_cid is required")
        
        # 检查是否已存在
        result = await db.execute(
            select(Bar).where(Bar.bar_address == item.bar_address)
        )
        existing_bar = result.scalar_one_or_none()
        
        if existing_bar:
            raise HTTPException(status_code=400, detail="酒吧已存在，无法重复创建")
        
        # 从IPFS获取元数据
        try:
            metadata = fetch_metadata_from_ipfs(item.meta_cid)
        except Exception as ipfs_error:
            raise HTTPException(status_code=422, detail=f"无法从IPFS获取元数据: {str(ipfs_error)}")
        
        # 验证元数据格式
        if not isinstance(metadata, dict):
            raise HTTPException(status_code=422, detail="无效的IPFS元数据格式")
            
        # 解析元数据
        bar_metadata = metadata.get("metadata", {})
        if not bar_metadata:
            raise HTTPException(status_code=422, detail="IPFS元数据中缺少metadata字段")
            
        bar_name = bar_metadata.get("barName", "")
        bar_location = bar_metadata.get("barLocation", "")
        bar_intro = bar_metadata.get("barIntro", "")
        bar_photo = bar_metadata.get("barPhoto", "").replace("ipfs://", "")
        
        # 验证必需字段
        if not bar_name:
            raise HTTPException(status_code=422, detail="元数据中缺少barName字段")
        if not bar_location:
            raise HTTPException(status_code=422, detail="元数据中缺少barLocation字段")
        
        # 创建新记录
        bar = Bar(
            bar_address=item.bar_address,
            bar_name=bar_name,
            bar_photo=bar_photo,
            bar_location=bar_location,
            bar_intro=bar_intro,
            owned_recipes="[]",
            used_recipes="[]"
        )
        db.add(bar)
        
        await db.commit()
        
        return {"success": True}
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"创建失败: {str(e)}")

@router.get("/owned_recipes/{bar_address}")
async def get_all_owned_recipes(
    bar_address: str,
    db: AsyncSession = Depends(get_db)
):
    """获取某酒吧自己创建的所有 recipe NFT 地址。"""
    try:
        # 查询数据库中的Bar记录
        result = await db.execute(
            select(Bar).where(Bar.bar_address == bar_address)
        )
        bar = result.scalar_one_or_none()
        
        if not bar:
            raise HTTPException(status_code=404, detail="酒吧不存在")
        
        # 解析owned_recipes字段
        owned_recipes = json.loads(bar.owned_recipes) if bar.owned_recipes else []
        
        return owned_recipes
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="owned_recipes数据格式错误")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@router.get("/used_recipes/{bar_address}")
async def get_all_used_recipes(
    bar_address: str,
    db: AsyncSession = Depends(get_db)
):
    """获取某酒吧通过交易获得的所有 recipe NFT 地址。"""
    try:
        # 查询数据库中的Bar记录
        result = await db.execute(
            select(Bar).where(Bar.bar_address == bar_address)
        )
        bar = result.scalar_one_or_none()
        
        if not bar:
            raise HTTPException(status_code=404, detail="酒吧不存在")
        
        # 解析used_recipes字段
        used_recipes = json.loads(bar.used_recipes) if bar.used_recipes else []
        
        return used_recipes
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="used_recipes数据格式错误")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")


