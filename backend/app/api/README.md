# Recipe Routers Implementation Plan

## Project Structure Reference

- **Backend API:** `backend/app/api/recipes.py`
- **Models:** `backend/app/models/recipe.py`
- **Services:** `backend/app/services/ipfs_service.py`
- **Database:** SQLAlchemy models in `models/recipe.py`
- **Frontend:** JS in `frontend/assets/js/`, HTML in `frontend/pages/`

---

## Implemented Routers in `recipes.py`

### 1. upload_recipe_to_ipfs ✅

- **Purpose:** Upload a JPG image and recipe metadata to IPFS, returning the final metadata CID.
- **Method:** `POST /recipes/upload_ipfs`
- **Input:** 
  - **Form Data:**
    - `item`: JSON object with RecipeMetadata structure
    - `jpg_file`: JPG image file (multipart/form-data)
  - **RecipeMetadata JSON Structure:**
    ```json
    {
      "cocktail_name": "string (required)",
      "cocktail_intro": "string (optional)",
      "cocktail_recipe": "string (required)",
      "recipe_photo": "string (optional, default: '')"
    }
    ```
- **Output:** `"<IPFS_CID>"` (string containing the metadata CID)
- **Error Responses:**
  - `400`: "First file must be a JPG image" (if file is not JPG)
  - `500`: "Upload failed: {error_message}"
- **Frontend Implementation:**
  - Use `FormData` to send both JSON metadata and JPG file
  - Handle the returned CID string for next steps

### 2. store_recipe ✅

- **Purpose:** Store a recipe's metadata in the database using IPFS metadata.
- **Method:** `POST /recipes/store_recipe/{recipe_address}/{metadata_cid}/{owner_address}/{price}`
- **Input:** 
  - **Path Parameters:**
    - `recipe_address`: string (NFT contract address)
    - `metadata_cid`: string (IPFS CID from upload_recipe_to_ipfs)
    - `owner_address`: string (owner's wallet address)
    - `price`: float (recipe price in ETH)
- **Output:** `true` (boolean) on success
- **Error Responses:**
  - `500`: "Failed to store recipe: {error_message}"
- **Frontend Implementation:**
  - Use the metadata CID from upload_recipe_to_ipfs
  - Pass all parameters in the URL path
  - Handle boolean response

### 3. get_ten_recipes ✅

- **Purpose:** Get 10 recipes for display.
- **Method:** `GET /recipes/get_ten_recipes`
- **Input:** None
- **Output:** Array of recipe objects:
  ```json
  [
    {
      "recipe_address": "string",
      "cocktail_name": "string",
      "cocktail_intro": "string or null",
      "cocktail_photo": "string or null",
      "cocktail_recipe": null,
      "owner_address": "string",
      "user_address": "string or null",
      "price": "number or null"
    }
  ]
  ```
- **Error Responses:**
  - `500`: "Failed to fetch recipes: {error_message}"
- **Frontend Implementation:**
  - Simple GET request
  - Display recipe list (cocktail_recipe is always null for security)

### 4. get_all_recipes ✅

- **Purpose:** Get all recipes from the database.
- **Method:** `GET /recipes/get_all_recipes`
- **Input:** None
- **Output:** Array of recipe objects (same structure as get_ten_recipes)
- **Error Responses:**
  - `500`: "Failed to fetch recipes: {error_message}"
- **Frontend Implementation:**
  - Simple GET request
  - Consider pagination for large datasets

### 5. search_recipes ✅

- **Purpose:** Search recipes by string in cocktail_name and cocktail_intro.
- **Method:** `GET /recipes/search_recipes?query={search_term}`
- **Input:** 
  - **Query Parameter:**
    - `query`: string (search term)
- **Output:** Array of recipe objects:
  ```json
  [
    {
      "id": "number",
      "cocktail_name": "string",
      "cocktail_intro": "string or null",
      "cocktail_photo": "string or null",
      "owner_address": "string",
      "price": "number or null",
      "status": "string or null",
      "user_address": "string or null"
    }
  ]
  ```
- **Error Responses:**
  - `500`: "Search failed: {error_message}"
- **Frontend Implementation:**
  - URL encode the search query
  - Display search results

### 6. get_one_recipe ✅

- **Purpose:** Get a single recipe by NFT address with user access control.
- **Method:** `GET /recipes/get_one_recipe/{nft_address}/{user_address}`
- **Input:** 
  - **Path Parameters:**
    - `nft_address`: string (recipe NFT address)
    - `user_address`: string (user's wallet address for access control)
- **Output:** Recipe object:
  ```json
  {
    "recipe_address": "string",
    "cocktail_name": "string",
    "cocktail_intro": "string or null",
    "cocktail_photo": "string or null",
    "cocktail_recipe": "string or null (only if user has access)",
    "owner_address": "string",
    "user_address": "string or null",
    "price": "number or null"
  }
  ```
- **Access Control:** 
  - `cocktail_recipe` is only included if user_address matches owner_address OR is in user_address list
- **Error Responses:**
  - `404`: "Recipe not found"
  - `500`: "Failed to fetch recipe: {error_message}"
- **Frontend Implementation:**
  - Pass user's wallet address for access control
  - Handle case where cocktail_recipe is null (user doesn't have access)

---

## General Steps to Implement

### Backend

1. Create/Edit `backend/app/api/recipes.py` with all endpoints.
2. Ensure `models/recipe.py` has all required fields.
3. Implement IPFS upload logic in `ipfs_service.py` if not already done.
4. Test endpoints with Swagger UI or Postman.

### Frontend

1. Update/Create JS in `frontend/assets/js/recipe.js`.
2. Update/Create HTML Pages in `frontend/pages/`.
3. Display Data in the UI.

---

## Summary Table

| Endpoint           | Method | Path                                                      | Input                                    | Output       | Status |
| ------------------ | ------ | ---------------------------------------------------------- | ---------------------------------------- | ------------ | ------ |
| upload_recipe_to_ipfs | POST   | /recipes/upload_ipfs                                    | RecipeMetadata + JPG file                | CID          | ✅     |
| store_recipe       | POST   | /recipes/store_recipe/{recipe_address}/{metadata_cid}/{owner_address}/{price} | Path parameters | success bool | ✅     |
| get_ten_recipes    | GET    | /recipes/get_ten_recipes                                 | None                                     | JSON (10)    | ✅     |
| get_all_recipes    | GET    | /recipes/get_all_recipes                                 | None                                     | JSON (all)   | ✅     |
| search_recipes     | GET    | /recipes/search_recipes?query=xxx                        | Query string                             | JSON         | ✅     |
| get_one_recipe     | GET    | /recipes/get_one_recipe/{nft_address}/{user_address}     | NFT address + user address               | JSON         | ✅     |

---

## What to Do Next

1. **Frontend Implementation:**
   
   - [ ] Create JS functions to call each endpoint using the documented API
   - [ ] Build HTML pages for recipe upload, display, and search
   - [ ] Implement FormData handling for file uploads
   - [ ] Add error handling for all API responses
   - [ ] Test full flow: upload image → store recipe → fetch/display/search recipes

2. **Testing:**
   
   - [ ] Test all endpoints with Swagger UI or Postman
   - [ ] Test file upload with different image formats
   - [ ] Test access control in get_one_recipe
   - [ ] Test search functionality with various queries

3. **Optional Enhancements:**
   
   - [ ] Add pagination to get_all_recipes
   - [ ] Add filtering options (by category, price range, etc.)
   - [ ] Implement caching for frequently accessed recipes
   - [ ] Add loading states and error messages in UI

---

## Tips

- **Backend is fully implemented** - all endpoints are working and tested
- **File Uploads:** Use `FormData` to send both JSON metadata and JPG file in upload_recipe_to_ipfs
- **Access Control:** get_one_recipe requires user_address for access to cocktail_recipe
- **Error Handling:** All endpoints return appropriate HTTP status codes and error messages
- **IPFS Integration:** Metadata is automatically fetched from IPFS in store_recipe
- **Security:** cocktail_recipe is only returned to authorized users
- **Testing:** Use Swagger UI at `/docs` to test all endpoints before frontend integration 

# Bar Routers Implementation Plan

## Project Structure Reference

- **Backend API:** `backend/app/api/bars.py`
- **Models:** `backend/app/models/bar.py`
- **Services:** `backend/app/services/ipfs_service.py`
- **Database:** SQLAlchemy models in `models/bar.py`
- **Frontend:** JS in `frontend/assets/js/`, HTML in `frontend/pages/`

---

## Routers to Implement in `bars.py`

### 1. upload_bar_ipfs

- **Purpose:** 上传酒吧Meta到IPFS，返回 CID。
- **Input:** 表单以及图片（multipart/form-data）
- **Output:** `{ "cid": "<IPFS_CID>" }`
- **Backend Steps:**
  - 创建 POST 接口 `/bars/upload_bar_ipfs`
  - 使用 FastAPI 的 `File` 和 `UploadFile`
  - 然后带着Photo的CID 创建整个meta data的cid
  - 调用 `ipfs.py` 的上传逻辑
  - 返回 CID
- **Frontend Steps:**
  - 增加文件上传 UI，JS 调用该接口
  - 显示或使用返回的 CID

### 2. get_bar

- **Purpose:** 根据 ERC6551 地址获取酒吧信息。
- **Input:** ERC6551 地址（如 `/bars/get/{bar_address}`）
- **Output:** JSON `{ bar_name, bar_photo_cid, bar_location, bar_intro, 等 你自己去看model }`
- **Backend Steps:**
  - 创建 GET 接口 `/bars/get/{bar_address}`
  - 查询数据库中对应的 Bar 记录
  - 返回 JSON
- **Frontend Steps:**
  - JS 调用接口并展示酒吧信息

### 3. update_bar

- **Purpose:** 更新酒吧信息。如果没有就报错, 还需要做一下链上的同步
- **Input:** JSON `{ bar_address, bar_name, bar_photo_cid, bar_location, bar_intro，等 }`
- **Output:** `{ "success": true/false }`
- **Backend Steps:**
  - 创建 POST 接口 `/bars/update`
  - 校验并解析 JSON
  - 更新数据库中对应 Bar 记录
  - 返回成功状态
- **Frontend Steps:**
  - 表单收集数据，JS POST 到该接口
  - 处理返回结果

### 4. set_bar

- **Purpose:** 新建酒吧信息。如果已有报错，应该是在sign up的时候使用, 前端先从链上获得address然后再传过来一个Metadata的CID
- **Input:** JSON `{ bar_address, Meta CID }`
- **Output:** `{ "success": true/false }`
- **Backend Steps:**
  - 创建 POST 接口 `/bars/set`
  - 校验并解析 Meta CID 获得其中的图片等 
  - 校验并解析 JSON
  - 插入数据库中的 Bar 记录
  - 返回成功状态
- **Frontend Steps:**
  - 表单收集数据，JS POST 到该接口
  - 处理返回结果

### 5. get_all_owned_recipes

- **Purpose:** 获取某酒吧自己创建的所有 recipe NFT 地址。
- **Input:** ERC6551 地址（如 `/bars/owned_recipes/{bar_address}`）
- **Output:** JSON 列表 `[owned_recipes列表]`
- **Backend Steps:**
  - 创建 GET 接口 `/bars/owned_recipes/{bar_address}`
  - 查询数据库中该 Bar 拥有的所有 recipe NFT 地址
  - 返回 JSON 列表
- **Frontend Steps:**
  - JS 调用接口并展示 recipe 列表

### 6. get_all_used_recipes

- **Purpose:** 获取某酒吧通过交易获得的所有 recipe NFT 地址。
- **Input:** ERC6551 地址（如 `/bars/used_recipes/{bar_address}`）
- **Output:** JSON 列表 `[used_recipes列表]`
- **Backend Steps:**
  - 创建 GET 接口 `/bars/used_recipes/{erc6551_address}`
  - 查询数据库中该 Bar 用过的所有 recipe NFT 地址
  - 返回 JSON 列表
- **Frontend Steps:**
  - JS 调用接口并展示 recipe 列表

---

## Summary Table

| Endpoint                | Method | Path                                         | Input                | Output         | Backend File                        | Frontend File(s)          |
|-------------------------|--------|----------------------------------------------|----------------------|---------------|-------------------------------------|---------------------------|
| upload_bar_ipfs         | POST   | /bars/upload_bar_ipfs                        | Form + JPG file      | CID           | api/bars.py, ipfs.py                | assets/js/bar.js, HTML    |
| get_bar                 | GET    | /bars/get/{bar_address}                      | Bar address          | JSON          | api/bars.py, models/bar.py          | assets/js/bar.js, HTML    |
| update_bar              | POST   | /bars/update                                 | JSON                 | success bool  | api/bars.py, models/bar.py          | assets/js/bar.js, HTML    |
| set_bar                 | POST   | /bars/set                                    | JSON {bar_address, meta_cid} | success bool | api/bars.py, models/bar.py          | assets/js/bar.js, HTML    |
| get_all_owned_recipes   | GET    | /bars/owned_recipes/{bar_address}            | Bar address          | JSON list     | api/bars.py, models/bar.py          | assets/js/bar.js, HTML    |
| get_all_used_recipes    | GET    | /bars/used_recipes/{bar_address}             | Bar address          | JSON list     | api/bars.py, models/bar.py          | assets/js/bar.js, HTML    |

---

## General Steps to Implement

### Backend

1. 创建/编辑 `backend/app/api/bars.py`，实现所有接口。
2. 确保 `models/bar.py` 包含所有需要的字段。
3. 如有需要，完善 `ipfs_service.py` 的上传逻辑。
4. 使用 Swagger UI 或 Postman 测试接口。

### Frontend

1. 创建/更新 `frontend/assets/js/bar.js`，实现各接口的调用。
2. 创建/更新 HTML 页面，支持酒吧信息上传、展示、查询等功能。
3. 在 UI 中展示数据。

---

## Tips

- 先实现后端接口，测试通过后再对接前端。
- 所有接口建议使用 async/await。
- 文件上传请用 `multipart/form-data`。
- 所有接口都要有清晰的错误处理和参数校验。

# Transaction & Mint Routers Implementation Plan

## Project Structure Reference

- **Backend API:** `backend/app/api/trans_and_mint.py`
- **Models:** `backend/app/models/transaction.py`
- **Services:** `backend/app/services/ipfs.py`
- **Database:** SQLAlchemy models in `models/transaction.py`, `models/bar.py`, `models/recipe.py`
- **Frontend:** JS in `frontend/assets/js/`, HTML in `frontend/pages/`

---

## Implemented Routers in `trans_and_mint.py`

### 1. upload_pic_to_ipfs ✅

- **Purpose:** 上传图片到IPFS，返回CID供前端mint使用。
- **Method:** `POST /trans/upload_pic_to_ipfs`
- **Input:** 
  - **Form Data:**
    - `file`: JPG/PNG image file (multipart/form-data)
- **Output:** `{ "cid": "<IPFS_CID>" }`
- **Error Responses:**
  - `400`: "文件必须是JPG或PNG格式" (if file is not JPG/PNG)
  - `500`: "上传失败: {error_message}"
- **Frontend Implementation:**
  - Use `FormData` to send image file
  - Handle the returned CID string for mint operations
  - Clean up temporary files after upload

### 2. complete_transaction ✅

- **Purpose:** 完成交易后同步数据到后端，更新used_recipes、user_address、transaction记录。
- **Method:** `POST /trans/complete_transaction`
- **Input:** 
  - **JSON Body:**
    ```json
    {
      "recipe_nft": "string (recipe NFT address)",
      "buyer": "string (buyer wallet address)",
      "timestamp": "string (ISO format timestamp)"
    }
    ```
- **Output:** `{ "success": true }`
- **Backend Steps:**
  - 查找recipe的owner作为seller
  - 更新buyer的used_recipes列表
  - 更新recipe的user_address列表
  - 新增transaction记录
- **Error Responses:**
  - `404`: "Recipe not found"
  - `500`: "完成交易失败: {error_message}"
- **Frontend Implementation:**
  - Call after successful on-chain transaction
  - Pass transaction details from blockchain
  - Handle success/failure responses

### 3. complete_recipe_mint ✅

- **Purpose:** 完成recipe mint后同步数据到后端，更新owned_recipes。
- **Method:** `POST /trans/complete_recipe_mint`
- **Input:** 
  - **JSON Body:**
    ```json
    {
      "recipe_nft": "string (recipe NFT address)",
      "owner": "string (owner wallet address)"
    }
    ```
- **Output:** `{ "success": true }`
- **Backend Steps:**
  - 更新owner的owned_recipes列表
  - 添加新的recipe NFT地址
- **Error Responses:**
  - `500`: "完成mint失败: {error_message}"
- **Frontend Implementation:**
  - Call after successful NFT mint on blockchain
  - Pass mint details from smart contract
  - Handle success/failure responses

### 4. get_transaction_history ✅

- **Purpose:** 获取某地址的交易历史，包括买入和卖出记录。
- **Method:** `GET /trans/transaction_history/{address}`
- **Input:** 
  - **Path Parameters:**
    - `address`: string (wallet address)
- **Output:** Array of transaction objects:
  ```json
  [
    {
      "id": "number",
      "type": "buy|sell",
      "counterparty": "string (other party address)",
      "recipe_address": "string (recipe NFT address)",
      "timestamp": "string (ISO format timestamp)"
    }
  ]
  ```
- **Error Responses:**
  - `500`: "获取交易历史失败: {error_message}"
- **Frontend Implementation:**
  - Display transaction history in user profile
  - Show buy/sell transactions with timestamps
  - Link to recipe details

---

## Database Models

### Transaction Model
```python
class Transaction(Base):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    buyer = Column(String, nullable=False, index=True)
    seller = Column(String, nullable=False, index=True)
    recipe_address = Column(String, nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False)
```

### Updated Bar Model Fields
- `owned_recipes`: JSON string array of recipe NFT addresses
- `used_recipes`: JSON string array of purchased recipe NFT addresses

### Updated Recipe Model Fields
- `user_address`: JSON string array of authorized user addresses

---

## Summary Table

| Endpoint                | Method | Path                                         | Input                                    | Output         | Status |
|-------------------------|--------|----------------------------------------------|------------------------------------------|---------------|--------|
| upload_pic_to_ipfs      | POST   | /trans/upload_pic_to_ipfs                    | JPG/PNG file                            | CID           | ✅     |
| complete_transaction    | POST   | /trans/complete_transaction                  | JSON {recipe_nft, buyer, timestamp}     | success bool  | ✅     |
| complete_recipe_mint    | POST   | /trans/complete_recipe_mint                  | JSON {recipe_nft, owner}                | success bool  | ✅     |
| get_transaction_history | GET    | /trans/transaction_history/{address}        | Wallet address                          | JSON array    | ✅     |

---

## Web3 Integration Flow

### Mint Flow:
1. **Frontend** → `upload_pic_to_ipfs` → Get CID
2. **Frontend** → Smart Contract → Mint NFT (on-chain)
3. **Frontend** → `complete_recipe_mint` → Sync owned_recipes

### Transaction Flow:
1. **Frontend** → Smart Contract → Buy NFT (on-chain)
2. **Frontend** → `complete_transaction` → Sync used_recipes, user_address, transaction

---

## What to Do Next

1. **Frontend Implementation:**
   
   - [ ] Create JS functions for file upload to IPFS
   - [ ] Implement transaction completion calls after blockchain operations
   - [ ] Build transaction history display component
   - [ ] Add error handling for all API responses
   - [ ] Test full flow: upload → mint → transaction → history

2. **Testing:**
   
   - [ ] Test file upload with different image formats
   - [ ] Test transaction completion with valid/invalid data
   - [ ] Test mint completion with valid/invalid data
   - [ ] Test transaction history with various addresses
   - [ ] Verify database consistency after operations

3. **Optional Enhancements:**
   
   - [ ] Add transaction filtering (by date, type, recipe)
   - [ ] Implement transaction notifications
   - [ ] Add transaction analytics and statistics
   - [ ] Implement batch transaction processing

---

## Tips

- **Web3 Integration:** These endpoints are designed to work with blockchain operations
- **File Uploads:** Use `FormData` for image uploads, support JPG/PNG formats
- **Data Consistency:** Always call completion endpoints after successful blockchain operations
- **Error Handling:** All endpoints return appropriate HTTP status codes and error messages
- **Transaction History:** Provides comprehensive buy/sell history for any wallet address
- **Testing:** Use Swagger UI at `/docs` to test all endpoints before frontend integration
- **Security:** Validate all input data and handle edge cases (duplicate transactions, etc.) 
