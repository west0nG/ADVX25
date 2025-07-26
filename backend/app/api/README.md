# Recipe Routers Implementation Plan

## Project Structure Reference

- **Backend API:** `backend/app/api/recipes.py`
- **Models:** `backend/app/models/recipe.py`
- **Services:** `backend/app/services/ipfs_service.py`
- **Database:** SQLAlchemy models in `models/recipe.py`
- **Frontend:** JS in `frontend/assets/js/`, HTML in `frontend/pages/`

---

## Routers to Implement in `recipes.py`

### 1. upload_ipfs

- **Purpose:** Upload a JPG image to IPFS and return its CID.
- **Input:** JPG file (multipart/form-data)
- **Output:** `{ "cid": "<IPFS_CID>" }`
- **Backend Steps:**
  - Create a POST endpoint `/recipes/upload_ipfs`
  - Use FastAPI’s `File` and `UploadFile`
  - Call IPFS upload logic (in `ipfs_service.py`)
  - Return the CID
- **Frontend Steps:**
  - Add file upload UI and JS to call this endpoint
  - Display or use the returned CID

### 2. store_recipe

- **Purpose:** Store a recipe’s metadata in the database.
- **Input:** JSON `{ recipe_name, intro, owner_nft_address, ..., cid, nft_id, nft_hash }`
- **Output:** `{ "success": true/false }`
- **Backend Steps:**
  - Create a POST endpoint `/recipes/store`
  - Validate and parse JSON body
  - Store data in the `Recipe` table
  - Return success status
- **Frontend Steps:**
  - Add form/UI to collect recipe data
  - JS to POST JSON to this endpoint
  - Handle response

### 3. get_ten_recipes

- **Purpose:** Get 10 recipes for display.
- **Input:** None
- **Output:** JSON array of up to 10 recipes
- **Backend Steps:**
  - Create a GET endpoint `/recipes/ten`
  - Query the first 10 recipes from the database
  - Return as JSON
- **Frontend Steps:**
  - JS to fetch and display these recipes

### 4. get_all_recipes

- **Purpose:** Get all recipes.
- **Input:** None
- **Output:** JSON array of all recipes
- **Backend Steps:**
  - Create a GET endpoint `/recipes/all`
  - Query all recipes from the database
  - Return as JSON
- **Frontend Steps:**
  - JS to fetch and display all recipes

### 5. search_recipes

- **Purpose:** Search recipes by a string.
- **Input:** Query string (e.g., `/recipes/search?query=xxx`)
- **Output:** JSON array of matching recipes
- **Backend Steps:**
  - Create a GET endpoint `/recipes/search`
  - Accept a query parameter
  - Query the database for recipes matching the string
  - Return results as JSON
- **Frontend Steps:**
  - Add search UI and JS to call this endpoint
  - Display results

### 6. get_one_recipe

- **Purpose:** Get a single recipe by NFT address.
- **Input:** NFT address (e.g., `/recipes/one/{nft_address}`)
- **Output:** JSON object with recipe details
- **Backend Steps:**
  - Create a GET endpoint `/recipes/one/{nft_address}`
  - Query the database for the recipe with the given NFT address
  - Return as JSON
- **Frontend Steps:**
  - JS to fetch and display the recipe details

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

| Endpoint        | Method | Path                       | Input              | Output       | Backend File                        | Frontend File(s)          |
| --------------- | ------ | -------------------------- | ------------------ | ------------ | ----------------------------------- | ------------------------- |
| upload_ipfs     | POST   | /recipes/upload_ipfs       | JPG file           | CID          | api/v1/recipes.py, ipfs_service.py  | assets/js/recipe.js, HTML |
| store_recipe    | POST   | /recipes/store             | JSON               | success bool | api/v1/recipes.py, models/recipe.py | assets/js/recipe.js, HTML |
| get_ten_recipes | GET    | /recipes/ten               | None               | JSON (10)    | api/v1/recipes.py                   | assets/js/recipe.js, HTML |
| get_all_recipes | GET    | /recipes/all               | None               | JSON (all)   | api/v1/recipes.py                   | assets/js/recipe.js, HTML |
| search_recipes  | GET    | /recipes/search?query=xxx  | Query string       | JSON         | api/v1/recipes.py                   | assets/js/recipe.js, HTML |
| get_one_recipe  | GET    | /recipes/one/{nft_address} | NFT address (path) | JSON         | api/v1/recipes.py                   | assets/js/recipe.js, HTML |

---

## What to Do Next

1. **Backend:**
   
   - [ ] Create/complete `backend/app/api/v1/recipes.py` with all endpoints.
   - [ ] Ensure `models/recipe.py` has all required fields.
   - [ ] Implement IPFS upload logic in `ipfs_service.py` if not already done.
   - [ ] Test endpoints with Swagger UI or Postman.

2. **Frontend:**
   
   - [ ] Create/update JS functions to call each endpoint.
   - [ ] Build or update HTML pages for recipe upload, display, and search.
   - [ ] Test full flow: upload image, store recipe, fetch/display/search recipes.

3. **(Optional) Add Unit/Integration Tests**

---

## Tips

- Start with backend endpoints, test with Swagger UI, then connect frontend.
- Use async endpoints and database access for consistency.
- For file uploads, use `multipart/form-data` in both backend and frontend.
- Use clear error handling and validation for all endpoints. 

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
