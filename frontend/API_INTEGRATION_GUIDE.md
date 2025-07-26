# Backend API Integration Guide

## Overview
This document describes how the frontend integrates with both the bars and recipes backend API endpoints.

## Backend Requirements

### Bars Endpoints (bars.py)
The backend should implement these endpoints:

1. **upload_bar_ipfs** - `POST /api/bars/upload_bar_ipfs`
   - Input: FormData with bar data (JSON or file)
   - Output: IPFS upload result

2. **get** - `GET /api/bars/get/{bar_address}`
   - Input: bar_address as path parameter
   - Output: Bar object with details

3. **update** - `POST /api/bars/update`
   - Input: JSON with updated bar data
   - Output: Update confirmation

4. **set** - `POST /api/bars/set`
   - Input: JSON with bar data
   - Output: Set confirmation

5. **owned_recipes** - `GET /api/bars/owned_recipes/{bar_address}`
   - Input: bar_address as path parameter
   - Output: Array of owned recipe objects

6. **used_recipes** - `GET /api/bars/used_recipes/{bar_address}`
   - Input: bar_address as path parameter
   - Output: Array of used recipe objects

### Recipes Endpoints (recipes.py)
The backend should implement these endpoints:

1. **upload_ipfs** - `POST /api/recipes/upload_ipfs`
   - Input: FormData with image file (jpg/png)
   - Output: `{ "cid": "QmXXXXXX..." }`

2. **store_recipe** - `POST /api/recipes/store_recipe/{recipe_address}/{metadata_cid}/{owner_address}/{price}`
   - Input: Path parameters for recipe storage
   - Output: `{ "success": true }` or boolean

3. **get_ten_recipes** - `GET /api/recipes/get_ten_recipes`
   - Input: none
   - Output: Array of recipe objects (limited to 10)

4. **get_all_recipes** - `GET /api/recipes/get_all_recipes`
   - Input: none
   - Output: Array of all recipe objects

5. **search_recipes** - `POST /api/recipes/search_recipes`
   - Input: `{ "query": "search term" }`
   - Output: Array of matching recipe objects

6. **get_one_recipe** - `GET /api/recipes/get_one_recipe/{nft_address}/{user_address}`
   - Input: nft_address and user_address as path parameters
   - Output: Single recipe object

## Data Structures

### Bar Data Structure

#### Frontend to Backend (set/update bar)
```json
{
  "name": "String",
  "address": "String (physical address)",
  "description": "String",
  "owner": "String (wallet address)",
  "established": "String",
  "bar_address": "String (blockchain address - for updates)"
}
```

#### Backend to Frontend (get bar)
```json
{
  "name": "String",
  "address": "String",
  "description": "String",
  "owner": "String",
  "established": "String",
  "bar_address": "String",
  "created_at": "String",
  "updated_at": "String"
}
```

### Recipe Data Structure

#### Frontend to Backend (store_recipe - path parameters)
- recipe_address: String (blockchain address)
- metadata_cid: String (IPFS CID)
- owner_address: String (wallet address)
- price: String (USDT amount)

#### Frontend to Backend (legacy store_recipe - JSON body)
```json
{
  "recipe_name": "String",
  "intro": "String (description)",
  "category": "classic|modern|tropical|non-alcoholic",
  "price": "String (USDT amount)",
  "royalties": "String (percentage)",
  "ingredients": ["Array", "of", "ingredient", "strings"],
  "instructions": ["Array", "of", "instruction", "strings"],
  "image_cid": "String (IPFS CID)",
  "owner_nft_address": "String (wallet address)",
  "nft_id": "String (unique identifier)",
  "nft_hash": "String (blockchain hash)",
  "created_at": "ISO date string"
}
```

#### Backend to Frontend (all get endpoints)
```json
{
  "recipe_name": "String",
  "intro": "String",
  "category": "String",
  "price": "String",
  "image_cid": "String",
  "owner_nft_address": "String",
  "nft_id": "String",
  "nft_hash": "String",
  "ingredients": ["Array"],
  "instructions": ["Array"],
  "created_at": "String"
}
```

## Configuration

### Update Backend URL
Edit `frontend/config/app.config.js`:
```javascript
api: {
    baseUrl: 'http://your-backend-server:port', // Change this to your backend URL
    endpoints: {
        bars: {
            uploadBarIPFS: '/bars/upload_bar_ipfs',
            getBar: '/bars/get',
            updateBar: '/bars/update',
            setBar: '/bars/set',
            getOwnedRecipes: '/bars/owned_recipes',
            getUsedRecipes: '/bars/used_recipes'
        },
        recipes: {
            uploadIPFS: '/recipes/upload_ipfs',
            storeRecipe: '/recipes/store_recipe',
            getTenRecipes: '/recipes/get_ten_recipes',
            getAllRecipes: '/recipes/get_all_recipes',
            searchRecipes: '/recipes/search_recipes',
            getOneRecipe: '/recipes/get_one_recipe'
        }
    }
}
```

### CORS Configuration
The backend must allow CORS for the frontend domain. Example headers:
```
Access-Control-Allow-Origin: http://localhost:8000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

**⚠️ CORS Issues?** See the complete [CORS Setup Guide](CORS_SETUP_GUIDE.md) and use the [CORS Debugging Tool](cors-test.html) for troubleshooting.

## Usage Examples

### Using the API Service

Load the API service and examples:
```html
<script src="assets/js/api-service.js"></script>
<script src="assets/js/api-examples.js"></script>
```

### Bars API Usage

```javascript
// Upload bar to IPFS
const barData = {
    name: "The Cocktail Lounge",
    address: "123 Main St, City",
    description: "A sophisticated cocktail bar",
    owner: "0x1234567890abcdef..."
};
const uploadResult = await apiService.uploadBarToIPFS(barData);

// Get bar information
const bar = await apiService.getBar("0x1234567890abcdef...");

// Update bar
const updateData = { ...barData, description: "Updated description" };
const updateResult = await apiService.updateBar(updateData);

// Get owned recipes for a bar
const ownedRecipes = await apiService.getOwnedRecipes("0x1234567890abcdef...");

// Get used recipes for a bar
const usedRecipes = await apiService.getUsedRecipes("0x1234567890abcdef...");
```

### Recipes API Usage

```javascript
// Upload image to IPFS
const fileInput = document.getElementById('recipe-image');
const imageCid = await apiService.uploadToIPFS(fileInput.files[0]);

// Store recipe (new path parameter method)
const storeResult = await apiService.storeRecipe(
    "0xrecipeaddress...",    // recipe_address
    "QmImageCID...",         // metadata_cid
    "0xowneraddress...",     // owner_address
    "0.05"                   // price
);

// Get all recipes
const allRecipes = await apiService.getAllRecipes();

// Search recipes
const searchResults = await apiService.searchRecipes("margarita");

// Get specific recipe
const recipe = await apiService.getOneRecipe(
    "0xnftaddress...",       // nft_address
    "0xuseraddress..."       // user_address
);
```

### Complete Workflow Examples

```javascript
// Complete recipe workflow
async function createAndStoreRecipe() {
    try {
        // 1. Upload image
        const imageCid = await apiService.uploadToIPFS(imageFile);
        
        // 2. Store recipe
        const result = await apiService.storeRecipe(
            recipeAddress, imageCid, ownerAddress, price
        );
        
        // 3. Verify storage
        const stored = await apiService.getOneRecipe(recipeAddress, ownerAddress);
        
        return { imageCid, result, stored };
    } catch (error) {
        console.error('Workflow failed:', error);
    }
}

// Complete bar workflow
async function createAndManageBar() {
    try {
        // 1. Upload bar data
        const uploadResult = await apiService.uploadBarToIPFS(barData);
        
        // 2. Set bar information
        const setResult = await apiService.setBar(barData);
        
        // 3. Get bar recipes
        const ownedRecipes = await apiService.getOwnedRecipes(barAddress);
        
        return { uploadResult, setResult, ownedRecipes };
    } catch (error) {
        console.error('Bar workflow failed:', error);
    }
}
```

## Error Handling

The frontend handles these scenarios:
- Backend unavailable (uses fallback data)
- API errors (shows error messages to user)
- Search failures (falls back to client-side search)
- Upload failures (shows error and allows retry)
- Network timeouts (automatic retries with exponential backoff)

## IPFS Integration

### Image Upload Flow
1. User selects image file
2. Frontend uploads to `/recipes/upload_ipfs`
3. Backend uploads to IPFS and returns CID
4. Frontend includes CID in recipe data
5. Images displayed using `https://ipfs.io/ipfs/{CID}`

### Bar Data Upload Flow
1. Frontend prepares bar data (JSON or file)
2. Frontend uploads to `/bars/upload_bar_ipfs`
3. Backend processes and uploads to IPFS
4. Backend returns IPFS result

## Testing

### Start the Frontend Server
```bash
cd frontend
python3 -m http.server 8000
```

### Test API Endpoints
1. Open browser developer tools
2. Navigate to any page that includes the API service
3. Open console and run:
```javascript
// List all available methods
apiExamples.listAvailableMethods();

// Test API health
await apiExamples.checkAPIHealth();

// Run example workflows
await apiExamples.exampleCompleteRecipeWorkflow();
await apiExamples.exampleCompleteBarWorkflow();
```

### Debug Mode
Add this to any page to see detailed API calls:
```javascript
window.DEBUG_API = true;
```

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend allows frontend domain
2. **404 errors**: Check backend endpoint URLs match config
3. **Image loading fails**: Verify IPFS gateway is accessible
4. **Form submission fails**: Check data format matches backend expectations
5. **Path parameter errors**: Ensure all required parameters are provided

### API Method Reference

#### Bars API Methods
- `uploadBarToIPFS(barData)` - Upload bar data to IPFS
- `getBar(barAddress)` - Get bar by address
- `updateBar(barData)` - Update existing bar
- `setBar(barData)` - Set new bar data
- `getOwnedRecipes(barAddress)` - Get recipes owned by bar
- `getUsedRecipes(barAddress)` - Get recipes used by bar

#### Recipes API Methods
- `uploadToIPFS(imageFile)` - Upload image to IPFS
- `uploadMetadataToIPFS(metadata)` - Upload metadata to IPFS
- `storeRecipe(recipeAddress, metadataCid, ownerAddress, price)` - Store recipe with path params
- `storeRecipeData(recipeData)` - Store recipe with JSON body (legacy)
- `getTenRecipes()` - Get 10 recent recipes
- `getAllRecipes()` - Get all recipes
- `searchRecipes(searchQuery)` - Search recipes by query
- `getOneRecipe(nftAddress, userAddress)` - Get recipe with path params
- `getOneRecipeByAddress(nftAddress)` - Get recipe with JSON body (legacy)

## Features Implemented

✅ **Bars Integration**
- Upload bar data to IPFS
- Create and update bar information
- Retrieve bar details by address
- Get owned and used recipes for bars

✅ **Marketplace Integration**
- Loads recipes from `get_all_recipes` or `get_ten_recipes`
- Displays recipe cards with images from IPFS
- Handles loading states and errors

✅ **Search Functionality**
- Uses `search_recipes` endpoint
- Falls back to client-side search if API fails
- Real-time search with debouncing

✅ **Recipe Creation**
- IPFS image upload via `upload_ipfs`
- Recipe storage via `store_recipe` (both path params and JSON body)
- Form validation and error handling

✅ **Recipe Details**
- Detailed view using `get_one_recipe`
- Shows ingredients and instructions
- Handles missing data gracefully

✅ **Error Handling & Retries**
- Automatic retry logic with exponential backoff
- Comprehensive error logging
- Graceful fallback handling

## Next Steps

1. Update `app.config.js` with your backend URL
2. Ensure backend implements all required endpoints
3. Test API integration with your backend
4. Add wallet connection for real NFT addresses
5. Implement actual blockchain integration
6. Add bar management UI components
7. Integrate bar-recipe relationships in the frontend 