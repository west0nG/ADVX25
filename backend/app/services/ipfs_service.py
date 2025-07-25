import json
import requests
import os
from typing import Dict, Optional
from fastapi import HTTPException

class IPFSService:
    """IPFS服务类，处理元数据上传和获取"""
    
    def __init__(self):
        # IPFS配置
        self.ipfs_gateway = os.getenv('IPFS_GATEWAY', 'https://ipfs.io/ipfs/')
        self.ipfs_api_url = os.getenv('IPFS_API_URL', 'https://api.ipfs.io/api/v0')
        self.pinata_api_key = os.getenv('PINATA_API_KEY')
        self.pinata_secret_key = os.getenv('PINATA_SECRET_KEY')
        
    def upload_metadata(self, metadata: Dict) -> str:
        """
        上传元数据到IPFS
        
        Args:
            metadata: 要上传的元数据字典
            
        Returns:
            IPFS URI (ipfs://...)
        """
        try:
            # 使用Pinata API上传（推荐用于生产环境）
            if self.pinata_api_key and self.pinata_secret_key:
                return self._upload_to_pinata(metadata)
            else:
                # 使用本地IPFS节点或公共API
                return self._upload_to_ipfs_api(metadata)
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to upload to IPFS: {str(e)}")
    
    def _upload_to_pinata(self, metadata: Dict) -> str:
        """使用Pinata上传到IPFS"""
        try:
            # 准备上传数据
            files = {
                'file': ('metadata.json', json.dumps(metadata, ensure_ascii=False), 'application/json')
            }
            
            headers = {
                'pinata_api_key': self.pinata_api_key,
                'pinata_secret_api_key': self.pinata_secret_key
            }
            
            # 上传到Pinata
            response = requests.post(
                f"{self.ipfs_api_url}/add",
                files=files,
                headers=headers
            )
            
            if response.status_code == 200:
                result = response.json()
                ipfs_hash = result['Hash']
                return f"ipfs://{ipfs_hash}"
            else:
                raise Exception(f"Pinata upload failed: {response.text}")
                
        except Exception as e:
            raise Exception(f"Pinata upload error: {str(e)}")
    
    def _upload_to_ipfs_api(self, metadata: Dict) -> str:
        """使用IPFS API上传"""
        try:
            # 准备上传数据
            files = {
                'file': ('metadata.json', json.dumps(metadata, ensure_ascii=False), 'application/json')
            }
            
            # 上传到IPFS
            response = requests.post(
                f"{self.ipfs_api_url}/add",
                files=files
            )
            
            if response.status_code == 200:
                result = response.json()
                ipfs_hash = result['Hash']
                return f"ipfs://{ipfs_hash}"
            else:
                raise Exception(f"IPFS upload failed: {response.text}")
                
        except Exception as e:
            raise Exception(f"IPFS upload error: {str(e)}")
    
    def get_metadata(self, ipfs_uri: str) -> Optional[Dict]:
        """
        从IPFS获取元数据
        
        Args:
            ipfs_uri: IPFS URI (ipfs://...)
            
        Returns:
            元数据字典，如果获取失败则返回None
        """
        try:
            # 解析IPFS URI
            if ipfs_uri.startswith('ipfs://'):
                ipfs_hash = ipfs_uri[7:]  # 移除 'ipfs://' 前缀
            else:
                ipfs_hash = ipfs_uri
            
            # 通过网关获取数据
            url = f"{self.ipfs_gateway}{ipfs_hash}"
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                return response.json()
            else:
                return None
                
        except Exception as e:
            print(f"Failed to get metadata from IPFS: {str(e)}")
            return None
    
    def create_bar_metadata(self, 
                           bar_photo: str,
                           bar_name: str,
                           bar_location: str,
                           bar_intro: str,
                           token_id: int) -> Dict:
        """
        创建酒吧元数据JSON
        
        Args:
            bar_photo: 酒吧照片URL
            bar_name: 酒吧名称
            bar_location: 酒吧位置
            bar_intro: 酒吧简介
            token_id: NFT token ID
            
        Returns:
            标准化的元数据字典
        """
        metadata = {
            "name": f"Bars Help Bars ID #{token_id}",
            "description": f"酒吧身份认证NFT - {bar_name}",
            "image": bar_photo,
            "external_url": "https://barshelpbars.com",
            "attributes": [
                {
                    "trait_type": "Bar Name",
                    "value": bar_name
                },
                {
                    "trait_type": "Location",
                    "value": bar_location
                },
                {
                    "trait_type": "Introduction",
                    "value": bar_intro
                },
                {
                    "trait_type": "Type",
                    "value": "Bar Identity NFT"
                },
                {
                    "trait_type": "Standard",
                    "value": "ERC-6551"
                }
            ],
            "properties": {
                "files": [
                    {
                        "type": "image/jpeg",
                        "uri": bar_photo
                    }
                ],
                "category": "image"
            }
        }
        
        return metadata
    
    def create_recipe_metadata(self,
                              cocktail_name: str,
                              cocktail_intro: str,
                              cocktail_photo: str,
                              cocktail_recipe: str,
                              recipe_photo: str,
                              token_id: int,
                              creator_address: str) -> Dict:
        """
        创建配方元数据JSON
        
        Args:
            cocktail_name: 鸡尾酒名称
            cocktail_intro: 鸡尾酒简介
            cocktail_photo: 鸡尾酒照片URL
            cocktail_recipe: 配方详情
            recipe_photo: 配方照片URL
            token_id: NFT token ID
            creator_address: 创建者地址
            
        Returns:
            标准化的元数据字典
        """
        metadata = {
            "name": f"{cocktail_name} Recipe #{token_id}",
            "description": f"鸡尾酒配方NFT - {cocktail_intro}",
            "image": cocktail_photo,
            "external_url": "https://barshelpbars.com",
            "attributes": [
                {
                    "trait_type": "Cocktail Name",
                    "value": cocktail_name
                },
                {
                    "trait_type": "Introduction",
                    "value": cocktail_intro
                },
                {
                    "trait_type": "Creator",
                    "value": creator_address
                },
                {
                    "trait_type": "Type",
                    "value": "Recipe NFT"
                },
                {
                    "trait_type": "Standard",
                    "value": "ERC-4907"
                }
            ],
            "properties": {
                "files": [
                    {
                        "type": "image/jpeg",
                        "uri": cocktail_photo
                    }
                ],
                "category": "image",
                "private_data": {
                    "recipe": cocktail_recipe,
                    "recipe_photo": recipe_photo
                }
            }
        }
        
        return metadata

# 创建全局实例
ipfs_service = IPFSService() 