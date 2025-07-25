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
            "mutable": True,
            "cocktail_name": cocktail_name,
            "cocktail_intro": cocktail_intro,
            "cocktail_photo": f"ipfs://{cocktail_photo_cid}",
            "cocktail_recipe": cocktail_recipe,
            "recipe_photo": f"ipfs://{recipe_photo_cid}"
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


def fetch_metadata_from_ipfs(cid: str) -> dict:
    """从IPFS获取元数据"""
    try:
        # 使用IPFS网关获取数据
        response = requests.get(f"https://gateway.pinata.cloud/ipfs/{cid}")
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"无法从IPFS获取数据: {response.status_code}")
    except Exception as e:
        raise Exception(f"获取IPFS元数据失败: {str(e)}")

