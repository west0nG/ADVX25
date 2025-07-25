# Backend API Integration Guide

## Overview
This document describes how the frontend integrates with the backend recipe API endpoints.

## Backend Requirements

### Router Endpoints (recipes.py)
The backend should implement these endpoints:

1. **upload_ipfs** - `POST /recipes/upload_ipfs`
   - Input: FormData with image file (jpg/png)
   - Output: `{ "cid": "QmXXXXXX..." }`

2. **store_recipe** - `POST /recipes/store_recipe`
   - Input: JSON with recipe data
   - Output: `{ "success": true }` or boolean

3. **get_ten_recipes** - `GET /recipes/get_ten_recipes`
   - Input: none
   - Output: Array of recipe objects

4. **get_all_recipes** - `GET /recipes/get_all_recipes`
   - Input: none
   - Output: Array of recipe objects

5. **search_recipes** - `POST /recipes/search_recipes`
   - Input: `{ "query": "search term" }`
   - Output: Array of matching recipe objects

6. **get_one_recipe** - `POST /recipes/get_one_recipe`
   - Input: `{ "nft_address": "0x..." }`
   - Output: Single recipe object

## Recipe Data Structure

### Frontend to Backend (store_recipe)
```json
{
  "recipe_name": "String",
  "intro": "String (description)",
  "category": "classic|modern|tropical|non-alcoholic",
  "price": "String (ETH amount)",
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

### Backend to Frontend (all get endpoints)
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
    // ... rest of config
}
```

### CORS Configuration
The backend must allow CORS for the frontend domain. Example headers:
```
Access-Control-Allow-Origin: http://localhost:8000
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Error Handling

The frontend handles these scenarios:
- Backend unavailable (uses fallback data)
- API errors (shows error messages to user)
- Search failures (falls back to client-side search)
- Upload failures (shows error and allows retry)

## IPFS Integration

### Image Upload Flow
1. User selects image file
2. Frontend uploads to `/recipes/upload_ipfs`
3. Backend uploads to IPFS and returns CID
4. Frontend includes CID in recipe data
5. Images displayed using `https://ipfs.io/ipfs/{CID}`

## Testing

### Start the Frontend Server
```bash
cd frontend
python3 -m http.server 8000
```

### Test API Endpoints
1. Open browser developer tools
2. Navigate to marketplace page
3. Check console for API calls
4. Test search functionality
5. Try creating a new recipe

## Troubleshooting

### Common Issues
1. **CORS errors**: Ensure backend allows frontend domain
2. **404 errors**: Check backend endpoint URLs match config
3. **Image loading fails**: Verify IPFS gateway is accessible
4. **Form submission fails**: Check recipe data format matches backend expectations

### Debug Mode
Add this to any page to see API calls:
```javascript
window.DEBUG_API = true;
```

## Features Implemented

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
- Recipe storage via `store_recipe`
- Form validation and error handling

✅ **Recipe Details**
- Detailed view using `get_one_recipe`
- Shows ingredients and instructions
- Handles missing data gracefully

## Next Steps

1. Update `app.config.js` with your backend URL
2. Ensure backend implements all required endpoints
3. Test API integration with your backend
4. Add wallet connection for real NFT addresses
5. Implement actual blockchain integration 