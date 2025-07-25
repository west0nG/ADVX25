import requests
from typing import Dict

PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwNzQ0MzAyMy1hZWFmLTRmMjUtOTk4My1jNDEyZGVkMzE2NGUiLCJlbWFpbCI6ImxpdXBlcmN5QDE2My5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNTUxODk5NDc4NTUyMzQzOWUxNDYiLCJzY29wZWRLZXlTZWNyZXQiOiIxYjNhMDM0YTU4ZjU2MjJiMzUwZmJkOGUyMmZlNmU3YmI4YmM4YTUwMTM4N2RlZDU5NzczZTU5NTcxODc1NmZjIiwiZXhwIjoxNzg0OTk3MDUzfQ.GxQTrpINoHnOU51LMHqEpUxzVkzWjKBUB2zK4JQZ7R0"
UPLOAD_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

def upload_to_pinata(file_path: str):
    headers = {
        "Authorization": f"Bearer {PINATA_JWT}"
    }
    with open(file_path, "rb") as f:
        files = {"file": f}
        response = requests.post(UPLOAD_URL, files=files, headers=headers)
    return response.json()

# 用法示例
# result = upload_to_pinata("/Users/mac/Desktop/Dataflow.png")
# print(result) 