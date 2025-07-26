// API Usage Examples
// This file demonstrates how to use all the available API endpoints

class APIExamples {
    constructor() {
        this.api = window.apiService;
    }

    // ===============================
    // BARS API EXAMPLES
    // ===============================

    async exampleUploadBarToIPFS() {
        try {
            // Example 1: Upload bar data as JSON
            const barData = {
                name: "The Cocktail Lounge",
                address: "123 Main St, City",
                description: "A sophisticated cocktail bar",
                owner: "0x1234567890abcdef...",
                established: "2023"
            };

            const result = await this.api.uploadBarToIPFS(barData);
            console.log('Bar uploaded to IPFS:', result);
            return result;

            // Example 2: Upload bar data as file
            // const fileInput = document.getElementById('bar-file');
            // const file = fileInput.files[0];
            // const result = await this.api.uploadBarToIPFS(file);
        } catch (error) {
            console.error('Error uploading bar:', error);
            throw error;
        }
    }

    async exampleGetBar() {
        try {
            const barAddress = "0x1234567890abcdef1234567890abcdef12345678";
            const bar = await this.api.getBar(barAddress);
            console.log('Retrieved bar:', bar);
            return bar;
        } catch (error) {
            console.error('Error getting bar:', error);
            throw error;
        }
    }

    async exampleUpdateBar() {
        try {
            const barData = {
                bar_address: "0x1234567890abcdef1234567890abcdef12345678",
                name: "Updated Bar Name",
                description: "Updated description",
                // ... other bar fields
            };

            const result = await this.api.updateBar(barData);
            console.log('Bar updated:', result);
            return result;
        } catch (error) {
            console.error('Error updating bar:', error);
            throw error;
        }
    }

    async exampleSetBar() {
        try {
            const barData = {
                name: "New Bar",
                address: "456 Oak Ave, City",
                owner: "0x9876543210fedcba...",
                // ... other bar fields
            };

            const result = await this.api.setBar(barData);
            console.log('Bar set:', result);
            return result;
        } catch (error) {
            console.error('Error setting bar:', error);
            throw error;
        }
    }

    async exampleGetOwnedRecipes() {
        try {
            const barAddress = "0x1234567890abcdef1234567890abcdef12345678";
            const recipes = await this.api.getOwnedRecipes(barAddress);
            console.log('Owned recipes:', recipes);
            return recipes;
        } catch (error) {
            console.error('Error getting owned recipes:', error);
            throw error;
        }
    }

    async exampleGetUsedRecipes() {
        try {
            const barAddress = "0x1234567890abcdef1234567890abcdef12345678";
            const recipes = await this.api.getUsedRecipes(barAddress);
            console.log('Used recipes:', recipes);
            return recipes;
        } catch (error) {
            console.error('Error getting used recipes:', error);
            throw error;
        }
    }

    // ===============================
    // RECIPES API EXAMPLES
    // ===============================

    async exampleUploadImageToIPFS() {
        try {
            // Assuming you have a file input element
            const fileInput = document.getElementById('recipe-image');
            const file = fileInput.files[0];

            if (!file) {
                throw new Error('No file selected');
            }

            const cid = await this.api.uploadToIPFS(file);
            console.log('Image uploaded to IPFS with CID:', cid);
            return cid;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }

    async exampleStoreRecipe() {
        try {
            // New method with path parameters
            const recipeAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
            const metadataCid = "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
            const ownerAddress = "0x1234567890abcdef1234567890abcdef12345678";
            const price = "0.1"; // in USDT

            const result = await this.api.storeRecipe(recipeAddress, metadataCid, ownerAddress, price);
            console.log('Recipe stored:', result);
            return result;
        } catch (error) {
            console.error('Error storing recipe:', error);
            throw error;
        }
    }

    async exampleStoreRecipeData() {
        try {
            // Legacy method with JSON body (for backward compatibility)
            const recipeData = {
                recipe_name: "Classic Margarita",
                intro: "A refreshing tequila-based cocktail",
                category: "classic",
                price: "0.05",
                royalties: "5",
                ingredients: [
                    "2 oz Tequila",
                    "1 oz Lime juice",
                    "1 oz Triple sec",
                    "Salt for rim"
                ],
                instructions: [
                    "Rim glass with salt",
                    "Combine ingredients in shaker with ice",
                    "Shake well",
                    "Strain into glass over ice"
                ],
                image_cid: "QmXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
                owner_nft_address: "0x1234567890abcdef1234567890abcdef12345678",
                nft_id: "123",
                nft_hash: "0xabcdef...",
                created_at: new Date().toISOString()
            };

            const result = await this.api.storeRecipeData(recipeData);
            console.log('Recipe data stored:', result);
            return result;
        } catch (error) {
            console.error('Error storing recipe data:', error);
            throw error;
        }
    }

    async exampleGetTenRecipes() {
        try {
            const recipes = await this.api.getTenRecipes();
            console.log('Ten recipes:', recipes);
            return recipes;
        } catch (error) {
            console.error('Error getting ten recipes:', error);
            throw error;
        }
    }

    async exampleGetAllRecipes() {
        try {
            const recipes = await this.api.getAllRecipes();
            console.log('All recipes:', recipes);
            return recipes;
        } catch (error) {
            console.error('Error getting all recipes:', error);
            throw error;
        }
    }

    async exampleSearchRecipes() {
        try {
            const searchQuery = "margarita";
            const recipes = await this.api.searchRecipes(searchQuery);
            console.log('Search results:', recipes);
            return recipes;
        } catch (error) {
            console.error('Error searching recipes:', error);
            throw error;
        }
    }

    async exampleGetOneRecipe() {
        try {
            // New method with path parameters
            const nftAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
            const userAddress = "0x1234567890abcdef1234567890abcdef12345678";

            const recipe = await this.api.getOneRecipe(nftAddress, userAddress);
            console.log('Retrieved recipe:', recipe);
            return recipe;
        } catch (error) {
            console.error('Error getting recipe:', error);
            throw error;
        }
    }

    async exampleGetOneRecipeByAddress() {
        try {
            // Legacy method with JSON body (for backward compatibility)
            const nftAddress = "0xabcdef1234567890abcdef1234567890abcdef12";
            const recipe = await this.api.getOneRecipeByAddress(nftAddress);
            console.log('Retrieved recipe by address:', recipe);
            return recipe;
        } catch (error) {
            console.error('Error getting recipe by address:', error);
            throw error;
        }
    }

    // ===============================
    // COMPLETE WORKFLOW EXAMPLES
    // ===============================

    async exampleCompleteRecipeWorkflow() {
        try {
            console.log('Starting complete recipe workflow...');

            // 1. Upload image to IPFS
            const fileInput = document.getElementById('recipe-image');
            if (!fileInput || !fileInput.files[0]) {
                throw new Error('Please select an image file');
            }
            
            const imageCid = await this.api.uploadToIPFS(fileInput.files[0]);
            console.log('✓ Image uploaded:', imageCid);

            // 2. Store recipe with the new endpoint format
            const recipeAddress = "0x" + Math.random().toString(16).substr(2, 40); // Generate random address for example
            const ownerAddress = "0x1234567890abcdef1234567890abcdef12345678";
            const price = "0.05";

            const storeResult = await this.api.storeRecipe(recipeAddress, imageCid, ownerAddress, price);
            console.log('✓ Recipe stored:', storeResult);

            // 3. Retrieve the stored recipe
            const userAddress = ownerAddress; // Same as owner for this example
            const retrievedRecipe = await this.api.getOneRecipe(recipeAddress, userAddress);
            console.log('✓ Recipe retrieved:', retrievedRecipe);

            return {
                imageCid,
                storeResult,
                retrievedRecipe
            };
        } catch (error) {
            console.error('Complete workflow failed:', error);
            throw error;
        }
    }

    async exampleCompleteBarWorkflow() {
        try {
            console.log('Starting complete bar workflow...');

            // 1. Create and upload bar data
            const barData = {
                name: "Example Bar",
                address: "123 Example St",
                description: "A great cocktail bar",
                owner: "0x1234567890abcdef1234567890abcdef12345678"
            };

            const uploadResult = await this.api.uploadBarToIPFS(barData);
            console.log('✓ Bar uploaded to IPFS:', uploadResult);

            // 2. Set bar information
            const setResult = await this.api.setBar(barData);
            console.log('✓ Bar set:', setResult);

            // 3. Get bar information
            const barAddress = "0x1234567890abcdef1234567890abcdef12345678";
            const retrievedBar = await this.api.getBar(barAddress);
            console.log('✓ Bar retrieved:', retrievedBar);

            // 4. Get owned recipes for the bar
            const ownedRecipes = await this.api.getOwnedRecipes(barAddress);
            console.log('✓ Owned recipes:', ownedRecipes);

            return {
                uploadResult,
                setResult,
                retrievedBar,
                ownedRecipes
            };
        } catch (error) {
            console.error('Complete bar workflow failed:', error);
            throw error;
        }
    }

    // ===============================
    // UTILITY METHODS
    // ===============================

    async checkAPIHealth() {
        try {
            const isHealthy = await this.api.checkHealth();
            console.log('API Health Status:', isHealthy ? 'Healthy' : 'Unhealthy');
            return isHealthy;
        } catch (error) {
            console.error('Health check failed:', error);
            return false;
        }
    }

    // Display all available methods for easy reference
    listAvailableMethods() {
        console.log('Available API Methods:');
        console.log('\n=== BARS API ===');
        console.log('- uploadBarToIPFS(barData)');
        console.log('- getBar(barAddress)');
        console.log('- updateBar(barData)');
        console.log('- setBar(barData)');
        console.log('- getOwnedRecipes(barAddress)');
        console.log('- getUsedRecipes(barAddress)');
        
        console.log('\n=== RECIPES API ===');
        console.log('- uploadToIPFS(imageFile)');
        console.log('- uploadMetadataToIPFS(metadata)');
        console.log('- storeRecipe(recipeAddress, metadataCid, ownerAddress, price)');
        console.log('- storeRecipeData(recipeData) // Legacy method');
        console.log('- getTenRecipes()');
        console.log('- getAllRecipes()');
        console.log('- searchRecipes(searchQuery)');
        console.log('- getOneRecipe(nftAddress, userAddress)');
        console.log('- getOneRecipeByAddress(nftAddress) // Legacy method');
        
        console.log('\n=== UTILITIES ===');
        console.log('- checkHealth()');
    }
}

// Create global instance
const apiExamples = new APIExamples();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIExamples;
} else {
    window.apiExamples = apiExamples;
}

// Auto-list methods when this file is loaded
console.log('API Examples loaded! Use apiExamples.listAvailableMethods() to see all available methods.'); 