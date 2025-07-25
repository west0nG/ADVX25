from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def list_nfts():
    """获取NFT市场列表（占位）"""
    return {"nfts": []}

@router.get("/{nft_id}")
def get_nft_detail(nft_id: str):
    """获取单个NFT详情（占位）"""
    return {"nft_id": nft_id, "detail": {}}
