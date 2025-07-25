from fastapi import APIRouter

router = APIRouter()

@router.get("/{address}/nfts")
def get_user_nfts(address: str):
    """获取某用户拥有的NFT列表（占位）"""
    return {"address": address, "nfts": []}
