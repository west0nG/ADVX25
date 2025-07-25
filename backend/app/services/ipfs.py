import requests
from typing import Dict

NFT_STORAGE_API_KEY = "184b204a.d97fbbed64cd4e37aaa3118a593d915a"

UPLOAD_URL = "https://api.nft.storage/upload"


def upload_to_nft_storage(file_path: str) -> Dict:
    headers = {
        "Authorization": f"Bearer {NFT_STORAGE_API_KEY}"
    }
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(UPLOAD_URL, files=files, headers=headers)
    return response.json() 