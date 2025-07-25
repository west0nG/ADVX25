from fastapi import APIRouter, Depends, HTTPException, Query, Form
from fastapi import UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_
from typing import List, Optional
import json
import os
from pydantic import BaseModel

from app.services.ipfs import upload_picture_to_pinata, upload_recipe_to_pinata, fetch_metadata_from_ipfs
from app.models.recipe import Recipe
from app.db.session import AsyncSessionLocal

router = APIRouter()

# Define Pydantic model for recipe metadata
class RecipeMetadata(BaseModel):
    cocktail_name: str
    cocktail_intro: Optional[str] = None
    cocktail_recipe: str
    recipe_photo: str = ""

# Define Pydantic model for storing recipe in database
class StoreRecipeRequest(BaseModel):
    cocktail_name: str
    recipe_address: str
    cocktail_intro: Optional[str] = None
    cocktail_photo: Optional[str] = None
    cocktail_recipe: Optional[str] = None
    owner_address: str
    user_address: List[str] = []
    price: Optional[float] = None

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@router.post("/upload_ipfs")
async def upload_recipe_to_ipfs(
    cocktail_name: str = Form(...),
    cocktail_intro: Optional[str] = Form(None),
    cocktail_recipe: str = Form(...),
    jpg_file: UploadFile = File(..., description="JPG image file")
):
    """Upload a JPG image and JSON metadata to IPFS, returning the final metadata CID."""
    # Validate JPG file
    if not jpg_file.filename.lower().endswith('.jpg'):
        raise HTTPException(status_code=400, detail="First file must be a JPG image")
    
    try:
        # Step 1: Save JPG file to ADVX25.backend.app.db.pics folder
        pics_folder = os.path.join(os.path.dirname(__file__), "..", "services", "pics")
        os.makedirs(pics_folder, exist_ok=True)
        jpg_file_path = os.path.join(pics_folder, jpg_file.filename)
        
        with open(jpg_file_path, "wb") as f:
            f.write(await jpg_file.read())
        
        # Step 2: Upload JPG to IPFS using upload_picture_to_pinata
        picture_cid = upload_picture_to_pinata(jpg_file_path)
        
        # Step 3: Upload recipe metadata to IPFS using upload_recipe_to_pinata
        final_cid = upload_recipe_to_pinata(cocktail_name, cocktail_intro, picture_cid, cocktail_recipe, None)
        return final_cid
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")



@router.post("/store_recipe/{recipe_address}/{metadata_cid}/{owner_address}/{price}")
async def store_recipe(
    recipe_address: str,
    metadata_cid: str,
    owner_address: str,
    price: float
):
    """Store a recipe's metadata in the database."""
    # get metadata from ipfs
    item1 = fetch_metadata_from_ipfs(metadata_cid)
    item = item1["metadata"]


    async with AsyncSessionLocal() as db:
        try:
            # Create new recipe using the validated Pydantic model
            recipe = Recipe(
                recipe_address=recipe_address,
                cocktail_intro=item["cocktail_intro"],
                cocktail_name=item["cocktail_name"],
                cocktail_photo=item["cocktail_photo"],
                cocktail_recipe=item["cocktail_recipe"],
                recipe_photo=None,
                owner_address=owner_address,
                user_address=json.dumps([]),
                price=price,
                status=None
            )            
            db.add(recipe)

            await db.commit()
            await db.refresh(recipe)
            return True

        except Exception as e:
            await db.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to store recipe: {str(e)}")

@router.get("/get_ten_recipes")
async def get_ten_recipes():
    """Get 10 recipes for display."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Recipe).limit(10))
            recipes = result.scalars().all()
            
            recipe_list = []
            for recipe in recipes:
                recipe_dict = {
                    "recipe_address": recipe.recipe_address,
                    "cocktail_name": recipe.cocktail_name,
                    "cocktail_intro": recipe.cocktail_intro,
                    "cocktail_photo": recipe.cocktail_photo,
                    "cocktail_recipe": None,
                    "owner_address": recipe.owner_address,
                    "user_address": recipe.user_address,
                    "price": recipe.price,
                }
                if recipe.user_address:
                    recipe_dict["user_address"] = json.loads(recipe.user_address)
                recipe_list.append(recipe_dict)
            return recipe_list
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch recipes: {str(e)}")

@router.get("/get_all_recipes")
async def get_all_recipes():
    """Get all recipes."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Recipe))
            recipes = result.scalars().all()
            
            recipe_list = []
            for recipe in recipes:
                recipe_dict = {
                    "recipe_address": recipe.recipe_address,
                    "cocktail_name": recipe.cocktail_name,
                    "cocktail_intro": recipe.cocktail_intro,
                    "cocktail_photo": recipe.cocktail_photo,
                    "cocktail_recipe": None,
                    "owner_address": recipe.owner_address,
                    "user_address": recipe.user_address,
                    "price": recipe.price,
                }
                if recipe.user_address:
                    recipe_dict["user_address"] = json.loads(recipe.user_address)
                recipe_list.append(recipe_dict)
            
            return recipe_list
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch recipes: {str(e)}")

@router.get("/search_recipes")
async def search_recipes(
    query: str = Query(..., description="Search query string")
):
    """Search recipes by a string."""
    async with AsyncSessionLocal() as db:
        try:
            # Search in cocktail_name, cocktail_intro, and cocktail_recipe
            result = await db.execute(
                select(Recipe).where(
                    or_(
                        Recipe.cocktail_name.ilike(f"%{query}%"),
                        Recipe.cocktail_intro.ilike(f"%{query}%"),
                    )
                )
            )
            recipes = result.scalars().all()
            
            recipe_list = []
            for recipe in recipes:
                recipe_dict = {
                    "id": recipe.id,
                    "cocktail_name": recipe.cocktail_name,
                    "cocktail_intro": recipe.cocktail_intro,
                    "cocktail_photo": recipe.cocktail_photo,
                    "owner_address": recipe.owner_address,
                    "price": recipe.price,
                    "status": recipe.status
                }
                if recipe.user_address:
                    recipe_dict["user_address"] = json.loads(recipe.user_address)
                recipe_list.append(recipe_dict)
            
            return recipe_list
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/get_one_recipe/{nft_address}/{user_address}") # search from what? ERC4907 address from chain? that's one additional step
async def get_one_recipe(
    nft_address: str,
    user_address: str
):
    """Get a single recipe by NFT address (owner_address)."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(
                select(Recipe).where(Recipe.recipe_address == nft_address)
            )
            recipe = result.scalar_one_or_none()
            
            if not recipe:
                raise HTTPException(status_code=404, detail="Recipe not found")
            
            recipe_dict = {
                "recipe_address": recipe.recipe_address,
                "cocktail_name": recipe.cocktail_name,
                "cocktail_intro": recipe.cocktail_intro,
                "cocktail_photo": recipe.cocktail_photo,
                "cocktail_recipe": None,
                "owner_address": recipe.owner_address,
                "user_address": recipe.user_address,
                "price": recipe.price,
            }
            if recipe.user_address and (user_address in json.loads(recipe.user_address) or user_address == recipe.owner_address):
                recipe_dict["cocktail_recipe"] = recipe.cocktail_recipe
            
            return recipe_dict
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch recipe: {str(e)}")
