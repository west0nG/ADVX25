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
                    let errorMessage = `HTTP error! status: ${response.status}`;
                    try {
                        const errorBody = await response.text();
                        console.error(`FormData API Error ${response.status}:`, errorBody);
                        
                        // Try to parse JSON error response
                        try {
                            const errorJson = JSON.parse(errorBody);
                            if (errorJson.detail) {
                                errorMessage += ` - ${errorJson.detail}`;
                            }
                        } catch (e) {
                            // If not JSON, use the raw text
                            if (errorBody) {
                                errorMessage += ` - ${errorBody}`;
                            }
                        }
                    } catch (e) {
                        console.error('Failed to read error response:', e);
                    }
                    throw new Error(errorMessage);
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
    // BARS API MUSDTODS
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

    // Upload bar image to IPFS
    async uploadBarImage(imageFile) {
        try {
            // Try the new endpoint first
            try {
                const formData = new FormData();
                formData.append('image', imageFile);

                const url = `${this.baseUrl}/bars/upload_image`;
                const result = await this.makeFormDataRequest(url, formData);
                
                return result;
            } catch (error) {
                // If 404, try fallback to existing bar IPFS endpoint
                if (error.message.includes('404')) {
                    console.warn('New image endpoint not available, using fallback');
                    return await this.uploadBarToIPFS(imageFile);
                }
                throw error;
            }
        } catch (error) {
            console.error('Failed to upload bar image:', error);
            throw error;
        }
    }

    // Upload bar metadata to IPFS
    async uploadBarMetadata(metadata) {
        try {
            // Try the new endpoint first
            try {
                const url = `${this.baseUrl}/bars/upload_metadata`;
                const result = await this.makeRequest(url, {
                    method: 'POST',
                    body: JSON.stringify(metadata)
                });
                
                return result;
            } catch (error) {
                // If 404, try fallback to existing bar IPFS endpoint
                if (error.message.includes('404')) {
                    console.warn('New metadata endpoint not available, using fallback');
                    return await this.uploadBarToIPFS(metadata);
                }
                throw error;
            }
        } catch (error) {
            console.error('Failed to upload bar metadata:', error);
            throw error;
        }
    }

    // Note: IDNFT creation should be handled by the CA1 contract directly
    // or integrated into the /api/bars/upload_bar_ipfs endpoint
    // No separate create_idnft endpoint exists in the API

    // ===============================
    // RECIPES API MUSDTODS
    // ===============================

    // Upload image to IPFS: jpg -> CID
    async uploadToIPFS(imageFile, metadata = {}) {
        try {
            // Validate file extension (backend requires .jpg)
            if (!imageFile.name.toLowerCase().endsWith('.jpg') && !imageFile.name.toLowerCase().endsWith('.jpeg')) {
                throw new Error('File must be a JPG image. Please select a .jpg or .jpeg file.');
            }
            
            const formData = new FormData();
            
            // The backend expects the file field to be named 'jpg_file'
            // Create a new file with .jpg extension if it's .jpeg
            let fileToUpload = imageFile;
            if (imageFile.name.toLowerCase().endsWith('.jpeg')) {
                const newName = imageFile.name.replace(/\.jpeg$/i, '.jpg');
                fileToUpload = new File([imageFile], newName, { type: imageFile.type });
            }
            
            formData.append('jpg_file', fileToUpload);
            
            // Add required metadata fields (with defaults if not provided)
            formData.append('cocktail_name', metadata.cocktail_name || 'Untitled Cocktail');
            formData.append('cocktail_intro', metadata.cocktail_intro || 'No description provided');
            formData.append('cocktail_recipe', metadata.cocktail_recipe || 'Recipe details not provided');

            console.log('Uploading to IPFS with data:', {
                fileName: fileToUpload.name,
                fileSize: fileToUpload.size,
                cocktail_name: metadata.cocktail_name,
                cocktail_intro: metadata.cocktail_intro,
                cocktail_recipe: metadata.cocktail_recipe?.substring(0, 100) + '...'
            });

            const url = `${this.baseUrl}${this.recipeEndpoints.uploadIPFS}`;
            const result = await this.makeFormDataRequest(url, formData);
            
            return result; // Return the full result object
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

    // ===============================
    // SMART CONTRACT INTEGRATION
    // ===============================

    // Get user's Recipe NFTs from smart contract
    async getUserRecipeNFTs(userAddress) {
        try {
            if (typeof ethers === 'undefined') {
                throw new Error('Ethers library not loaded');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contractAddress = APP_CONFIG.blockchain.recipeNft.address;
            const contractABI = APP_CONFIG.blockchain.recipeNft.abi;
            const contract = new ethers.Contract(contractAddress, contractABI, provider);

            // Get Recipe NFT token IDs owned by the user
            const tokenIds = await contract.getRecipeTokensByUser(userAddress);
            
            const recipeNFTs = [];
            for (const tokenId of tokenIds) {
                try {
                    // Get metadata for each token
                    const metadata = await contract.getRecipeMetadata(tokenId);
                    const tokenURI = await contract.getTokenURI(tokenId);
                    
                    recipeNFTs.push({
                        tokenId: tokenId.toString(),
                        tokenURI: tokenURI,
                        isActive: metadata.isActive,
                        createdAt: metadata.createdAt.toString(),
                        updatedAt: metadata.updatedAt.toString(),
                        price: metadata.price.toString(),
                        isForSale: metadata.isForSale,
                        idNFTTokenId: metadata.idNFTTokenId.toString(),
                        idNFTAccount: metadata.idNFTAccount
                    });
                } catch (error) {
                    console.warn(`Failed to get metadata for token ${tokenId}:`, error);
                }
            }

            return recipeNFTs;
        } catch (error) {
            console.error('Failed to get user Recipe NFTs:', error);
            throw error;
        }
    }

    // Get IPFS metadata for a Recipe NFT
    async getRecipeNFTMetadata(tokenURI) {
        try {
            if (tokenURI.startsWith('ipfs://')) {
                const cid = tokenURI.replace('ipfs://', '');
                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch IPFS metadata: ${response.status}`);
                }
                return await response.json();
            } else {
                const response = await fetch(tokenURI);
                if (!response.ok) {
                    throw new Error(`Failed to fetch metadata: ${response.status}`);
                }
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to get Recipe NFT metadata:', error);
            throw error;
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