// API Service for Backend Communication
class APIService {
    constructor() {
        this.baseUrl = APP_CONFIG.api.baseUrl;
        this.timeout = APP_CONFIG.api.timeout;
        this.retries = APP_CONFIG.api.retries;
        this.recipeEndpoints = APP_CONFIG.api.endpoints.recipes;
        this.barEndpoints = APP_CONFIG.api.endpoints.bars;
    }

    // Helper method to make HTTP requests with retries
    async makeRequest(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: this.timeout,
            ...options
        };

        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    ...defaultOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.warn(`Request attempt ${attempt} failed:`, error);
                
                if (attempt === this.retries) {
                    throw new Error(`Failed after ${this.retries} attempts: ${error.message}`);
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // Helper method for FormData requests (file uploads)
    async makeFormDataRequest(url, formData) {
        for (let attempt = 1; attempt <= this.retries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                const response = await fetch(url, {
                    method: 'POST',
                    body: formData,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.warn(`FormData request attempt ${attempt} failed:`, error);
                
                if (attempt === this.retries) {
                    throw new Error(`Failed after ${this.retries} attempts: ${error.message}`);
                }
                
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }

    // ===============================
    // BARS API METHODS
    // ===============================

    // Upload Bar to IPFS
    async uploadBarToIPFS(barData) {
        try {
            const formData = new FormData();
            
            // Handle different data types - if it's a file, append as is, otherwise as JSON
            if (barData instanceof File) {
                formData.append('bar_data', barData);
            } else {
                formData.append('bar_data', JSON.stringify(barData));
            }

            const url = `${this.baseUrl}${this.barEndpoints.uploadBarIPFS}`;
            const result = await this.makeFormDataRequest(url, formData);
            
            return result;
        } catch (error) {
            console.error('Failed to upload bar to IPFS:', error);
            throw error;
        }
    }

    // Get Bar by address
    async getBar(barAddress) {
        try {
            const url = `${this.baseUrl}${this.barEndpoints.getBar}/${barAddress}`;
            const result = await this.makeRequest(url);
            
            return result;
        } catch (error) {
            console.error('Failed to get bar:', error);
            throw error;
        }
    }

    // Update Bar
    async updateBar(barData) {
        try {
            const url = `${this.baseUrl}${this.barEndpoints.updateBar}`;
            const result = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(barData)
            });
            
            return result;
        } catch (error) {
            console.error('Failed to update bar:', error);
            throw error;
        }
    }

    // Set Bar
    async setBar(barData) {
        try {
            const url = `${this.baseUrl}${this.barEndpoints.setBar}`;
            const result = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(barData)
            });
            
            return result;
        } catch (error) {
            console.error('Failed to set bar:', error);
            throw error;
        }
    }

    // Get All Owned Recipes for a bar
    async getOwnedRecipes(barAddress) {
        try {
            const url = `${this.baseUrl}${this.barEndpoints.getOwnedRecipes}/${barAddress}`;
            const result = await this.makeRequest(url);
            
            return result.recipes || result;
        } catch (error) {
            console.error('Failed to get owned recipes:', error);
            throw error;
        }
    }

    // Get All Used Recipes for a bar
    async getUsedRecipes(barAddress) {
        try {
            const url = `${this.baseUrl}${this.barEndpoints.getUsedRecipes}/${barAddress}`;
            const result = await this.makeRequest(url);
            
            return result.recipes || result;
        } catch (error) {
            console.error('Failed to get used recipes:', error);
            throw error;
        }
    }

    // ===============================
    // RECIPES API METHODS
    // ===============================

    // Upload image to IPFS: jpg -> CID
    async uploadToIPFS(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const url = `${this.baseUrl}${this.recipeEndpoints.uploadIPFS}`;
            const result = await this.makeFormDataRequest(url, formData);
            
            return result.cid; // Assuming backend returns { cid: "..." }
        } catch (error) {
            console.error('Failed to upload to IPFS:', error);
            throw error;
        }
    }

    // Upload metadata to IPFS: json -> CID
    async uploadMetadataToIPFS(metadata) {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.uploadIPFS}`;
            const result = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify({ metadata: metadata })
            });
            
            return result.cid; // Assuming backend returns { cid: "..." }
        } catch (error) {
            console.error('Failed to upload metadata to IPFS:', error);
            throw error;
        }
    }

    // Store recipe with path parameters
    async storeRecipe(recipeAddress, metadataCid, ownerAddress, price) {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.storeRecipe}/${recipeAddress}/${metadataCid}/${ownerAddress}/${price}`;
            const result = await this.makeRequest(url, {
                method: 'POST'
            });
            
            return result.success || result;
        } catch (error) {
            console.error('Failed to store recipe:', error);
            throw error;
        }
    }

    // Legacy store recipe method for backward compatibility (with JSON body)
    async storeRecipeData(recipeData) {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.storeRecipe}`;
            const result = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(recipeData)
            });
            
            return result.success || result;
        } catch (error) {
            console.error('Failed to store recipe:', error);
            throw error;
        }
    }

    // Get ten recipes: none -> json{recipe name, intro, owner NFT address, ...}
    async getTenRecipes() {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.getTenRecipes}`;
            const result = await this.makeRequest(url);
            
            return result.recipes || result;
        } catch (error) {
            console.error('Failed to get ten recipes:', error);
            throw error;
        }
    }

    // Get all recipes: none -> json
    async getAllRecipes() {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.getAllRecipes}`;
            const result = await this.makeRequest(url);
            
            return result.recipes || result;
        } catch (error) {
            console.error('Failed to get all recipes:', error);
            throw error;
        }
    }

    // Search recipes: string -> json
    async searchRecipes(searchQuery) {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.searchRecipes}`;
            const result = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify({ query: searchQuery })
            });
            
            return result.recipes || result;
        } catch (error) {
            console.error('Failed to search recipes:', error);
            throw error;
        }
    }

    // Get one recipe with path parameters
    async getOneRecipe(nftAddress, userAddress) {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.getOneRecipe}/${nftAddress}/${userAddress}`;
            const result = await this.makeRequest(url);
            
            return result.recipe || result;
        } catch (error) {
            console.error('Failed to get recipe:', error);
            throw error;
        }
    }

    // Legacy get one recipe method for backward compatibility (with JSON body)
    async getOneRecipeByAddress(nftAddress) {
        try {
            const url = `${this.baseUrl}${this.recipeEndpoints.getOneRecipe}`;
            const result = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify({ nft_address: nftAddress })
            });
            
            return result.recipe || result;
        } catch (error) {
            console.error('Failed to get recipe:', error);
            throw error;
        }
    }

    // Helper method to check if backend is available
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            console.warn('Backend health check failed:', error);
            return false;
        }
    }
}

// Create global instance
const apiService = new APIService();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APIService;
} else {
    window.apiService = apiService;
} 