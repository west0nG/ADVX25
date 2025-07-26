import requests
import json
import tempfile
import os
from typing import Dict, Any
from app.config import PINATA_API_KEY, PINATA_API_SECRET

UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"
JSON_UPLOAD_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"


def upload_to_pinata_with_key(file_path: str) -> Dict:
    """使用API Key + Secret方式上传文件到Pinata IPFS"""
    if not PINATA_API_KEY or not PINATA_API_SECRET:
        raise ValueError("PINATA_API_KEY 或 PINATA_API_SECRET 环境变量未设置")
    
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(UPLOAD_URL, files=files, headers=headers)
    return response.json()


def upload_picture_to_pinata(file_path: str) -> str:
    """上传图片到Pinata IPFS，返回CID"""
    if not PINATA_API_KEY or not PINATA_API_SECRET:
        raise ValueError("PINATA_API_KEY 或 PINATA_API_SECRET 环境变量未设置")
    
    headers = {
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }
    
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(UPLOAD_URL, files=files, headers=headers)
    
    result = response.json()
    if response.status_code == 200 and "IpfsHash" in result:
        return result["IpfsHash"]
    else:
        raise Exception(f"上传图片失败: {result}")


def upload_recipe_to_pinata(
    cocktail_name: str,
    cocktail_intro: str,
    cocktail_photo_cid: str,
    cocktail_recipe: str,
    recipe_photo_cid: str
) -> str:
    """上传Recipe NFT元数据到Pinata IPFS，返回CID"""
    if not PINATA_API_KEY or not PINATA_API_SECRET:
        raise ValueError("PINATA_API_KEY 或 PINATA_API_SECRET 环境变量未设置")
    
    # 构建Recipe NFT元数据
    recipe_metadata = {
        "metadata": {
            "mutable": False,
            "cocktailName": cocktail_name,
            "cocktailIntro": cocktail_intro,
            "cocktailPhoto": f"ipfs://{cocktail_photo_cid}",
            "private": {
                "cocktailRecipe": cocktail_recipe,
                "recipePhoto": f"ipfs://{recipe_photo_cid}"
            }
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }
    
    response = requests.post(JSON_UPLOAD_URL, json=recipe_metadata, headers=headers)
    result = response.json()
    
    if response.status_code == 200 and "IpfsHash" in result:
        return result["IpfsHash"]
    else:
        raise Exception(f"上传Recipe元数据失败: {result}")


def upload_bar_to_pinata(
    bar_photo_cid: str,
    bar_name: str,
    bar_location: str,
    bar_intro: str
) -> str:
    """上传Bar ID NFT元数据到Pinata IPFS，返回CID"""
    if not PINATA_API_KEY or not PINATA_API_SECRET:
        raise ValueError("PINATA_API_KEY 或 PINATA_API_SECRET 环境变量未设置")
    
    # 构建Bar ID NFT元数据
    bar_metadata = {
        "metadata": {
            "mutable": True,
            "barPhoto": f"ipfs://{bar_photo_cid}",
            "barName": bar_name,
            "barLocation": bar_location,
            "barIntro": bar_intro
        }
    }
    
    headers = {
        "Content-Type": "application/json",
        "pinata_api_key": PINATA_API_KEY,
        "pinata_secret_api_key": PINATA_API_SECRET
    }
    
    response = requests.post(JSON_UPLOAD_URL, json=bar_metadata, headers=headers)
    result = response.json()
    
    if response.status_code == 200 and "IpfsHash" in result:
        return result["IpfsHash"]
    else:
        raise Exception(f"上传Bar元数据失败: {result}")


# 用法示例
# 1. 上传图片获取CID
cocktail_photo_cid = upload_picture_to_pinata("/Users/mac/Desktop/Dataflow.png")
recipe_photo_cid = upload_picture_to_pinata("/Users/mac/Desktop/Dataflow.png")

# 2. 上传Recipe元数据
recipe_metadata_cid = upload_recipe_to_pinata(
    cocktail_name="Mojito",
    cocktail_intro="经典古巴鸡尾酒",
    cocktail_photo_cid=cocktail_photo_cid,
    cocktail_recipe="朗姆酒 30ml, 青柠汁 15ml, 糖浆 10ml...",
    recipe_photo_cid=recipe_photo_cid
)

# 3. 上传Bar元数据
bar_photo_cid = upload_picture_to_pinata("/Users/mac/Desktop/Dataflow.png")
bar_metadata_cid = upload_bar_to_pinata(
    bar_photo_cid=bar_photo_cid,
    bar_name="蓝调酒吧",
    bar_location="北京市朝阳区",
    bar_intro="专注于经典鸡尾酒的精品酒吧"
) 

print(cocktail_photo_cid)
print(recipe_photo_cid)
print(recipe_metadata_cid)
print(bar_metadata_cid)

