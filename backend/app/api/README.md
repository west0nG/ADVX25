# Recipe Routers Implementation Plan

## Project Structure Reference
- **Backend API:** `backend/app/api/v1/recipes.py`
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
1. Create/Edit `backend/app/api/v1/recipes.py` with all endpoints.
2. Ensure `models/recipe.py` has all required fields.
3. Implement IPFS upload logic in `ipfs_service.py` if not already done.
4. Test endpoints with Swagger UI or Postman.

### Frontend
1. Update/Create JS in `frontend/assets/js/recipe.js`.
2. Update/Create HTML Pages in `frontend/pages/`.
3. Display Data in the UI.

---

## Summary Table

| Endpoint             | Method | Path                        | Input                | Output         | Backend File                | Frontend File(s)           |
|----------------------|--------|-----------------------------|----------------------|----------------|-----------------------------|----------------------------|
| upload_ipfs          | POST   | /recipes/upload_ipfs        | JPG file             | CID            | api/v1/recipes.py, ipfs_service.py | assets/js/recipe.js, HTML  |
| store_recipe         | POST   | /recipes/store              | JSON                 | success bool   | api/v1/recipes.py, models/recipe.py | assets/js/recipe.js, HTML  |
| get_ten_recipes      | GET    | /recipes/ten                | None                 | JSON (10)      | api/v1/recipes.py           | assets/js/recipe.js, HTML  |
| get_all_recipes      | GET    | /recipes/all                | None                 | JSON (all)     | api/v1/recipes.py           | assets/js/recipe.js, HTML  |
| search_recipes       | GET    | /recipes/search?query=xxx   | Query string         | JSON           | api/v1/recipes.py           | assets/js/recipe.js, HTML  |
| get_one_recipe       | GET    | /recipes/one/{nft_address}  | NFT address (path)   | JSON           | api/v1/recipes.py           | assets/js/recipe.js, HTML  |

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