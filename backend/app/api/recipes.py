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


"""
前端可以直接调用这个API上传图片/配方，后端会返回CID。
后续可以把这个上传接口和NFT创建、配方创建等业务结合起来。
"""
@router.post("/upload_ipfs_test")
def upload_ipfs_test(file: UploadFile = File(...)):
    """测试上传文件到IPFS，返回CID"""
    # 保存临时文件
    temp_path = f"/tmp/{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(file.file.read())
    result = upload_to_nft_storage(temp_path)
    return result