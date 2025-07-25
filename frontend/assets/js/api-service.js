// API Service for Backend Communication
class APIService {
    constructor() {
        this.baseUrl = APP_CONFIG.api.baseUrl;
        this.timeout = APP_CONFIG.api.timeout;
        this.retries = APP_CONFIG.api.retries;
        this.endpoints = APP_CONFIG.api.endpoints.recipes;
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

    // 1. Upload image to IPFS: jpg -> CID
    async uploadToIPFS(imageFile) {
        try {
            const formData = new FormData();
            formData.append('image', imageFile);

            const url = `${this.baseUrl}${this.endpoints.uploadIPFS}`;
            const result = await this.makeFormDataRequest(url, formData);
            
            return result.cid; // Assuming backend returns { cid: "..." }
        } catch (error) {
            console.error('Failed to upload to IPFS:', error);
            throw error;
        }
    }

    // 2. Store recipe: json{recipe name, intro, owner NFT address, ..., CID, NFT ID, NFT hash} -> bool
    async storeRecipe(recipeData) {
        try {
            const url = `${this.baseUrl}${this.endpoints.storeRecipe}`;
            const result = await this.makeRequest(url, {
                method: 'POST',
                body: JSON.stringify(recipeData)
            });
            
            return result.success || result; // Assuming backend returns { success: true } or boolean
        } catch (error) {
            console.error('Failed to store recipe:', error);
            throw error;
        }
    }

    // 3. Get ten recipes: none -> json{recipe name, intro, owner NFT address, ...}
    async getTenRecipes() {
        try {
            const url = `${this.baseUrl}${this.endpoints.getTenRecipes}`;
            const result = await this.makeRequest(url);
            
            return result.recipes || result; // Handle different response formats
        } catch (error) {
            console.error('Failed to get ten recipes:', error);
            throw error;
        }
    }

    // 4. Get all recipes: none -> json
    async getAllRecipes() {
        try {
            const url = `${this.baseUrl}${this.endpoints.getAllRecipes}`;
            const result = await this.makeRequest(url);
            
            return result.recipes || result;
        } catch (error) {
            console.error('Failed to get all recipes:', error);
            throw error;
        }
    }

    // 5. Search recipes: string -> json
    async searchRecipes(searchQuery) {
        try {
            const url = `${this.baseUrl}${this.endpoints.searchRecipes}`;
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

    // 6. Get one recipe: NFT address -> json
    async getOneRecipe(nftAddress) {
        try {
            const url = `${this.baseUrl}${this.endpoints.getOneRecipe}`;
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