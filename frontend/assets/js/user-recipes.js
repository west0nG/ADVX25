// User Recipe NFTs Display Module
class UserRecipeManager {
    constructor() {
        this.userAddress = null;
        this.userRecipes = [];
        this.isLoading = false;
    }

    // Initialize the manager
    async initialize() {
        try {
            // Connect wallet if not already connected
            if (typeof window.ethereum !== 'undefined') {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                this.userAddress = await signer.getAddress();
                console.log('User address:', this.userAddress);
            } else {
                throw new Error('MetaMask not found');
            }
        } catch (error) {
            console.error('Failed to initialize UserRecipeManager:', error);
            throw error;
        }
    }

    // Load user's Recipe NFTs
    async loadUserRecipes() {
        if (!this.userAddress) {
            await this.initialize();
        }

        this.isLoading = true;
        try {
            console.log('Loading Recipe NFTs for user:', this.userAddress);
            
            // Get Recipe NFTs from smart contract
            const recipeNFTs = await apiService.getUserRecipeNFTs(this.userAddress);
            console.log('Found Recipe NFTs:', recipeNFTs);

            // Load IPFS metadata for each NFT
            const recipesWithMetadata = [];
            for (const nft of recipeNFTs) {
                try {
                    const ipfsMetadata = await apiService.getRecipeNFTMetadata(nft.tokenURI);
                    recipesWithMetadata.push({
                        ...nft,
                        metadata: ipfsMetadata
                    });
                } catch (error) {
                    console.warn(`Failed to load metadata for token ${nft.tokenId}:`, error);
                    recipesWithMetadata.push({
                        ...nft,
                        metadata: {
                            name: `Recipe NFT #${nft.tokenId}`,
                            description: 'Metadata unavailable',
                            image: 'https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg'
                        }
                    });
                }
            }

            this.userRecipes = recipesWithMetadata;
            return this.userRecipes;
        } catch (error) {
            console.error('Failed to load user recipes:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    // Display user recipes in a container
    displayUserRecipes(containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        if (this.isLoading) {
            container.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading your Recipe NFTs...</p>
                </div>
            `;
            return;
        }

        if (this.userRecipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cocktail" style="font-size: 3rem; color: #25f2f2; margin-bottom: 1rem;"></i>
                    <h3>No Recipe NFTs Found</h3>
                    <p>You haven't created any Recipe NFTs yet.</p>
                    <a href="create-idnft.html" class="btn btn-primary">Create Your First Recipe</a>
                </div>
            `;
            return;
        }

        const recipesHTML = this.userRecipes.map(recipe => this.createRecipeCard(recipe)).join('');
        container.innerHTML = `
            <div class="user-recipes-header">
                <h2>Your Recipe NFTs (${this.userRecipes.length})</h2>
                <p>These Recipe NFTs are owned by your ID NFT's ERC-6551 account</p>
            </div>
            <div class="user-recipes-grid">
                ${recipesHTML}
            </div>
        `;
    }

    // Create HTML for a single recipe card
    createRecipeCard(recipe) {
        const imageUrl = recipe.metadata.image || 'https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg';
        const name = recipe.metadata.name || `Recipe NFT #${recipe.tokenId}`;
        const description = recipe.metadata.description || 'No description available';
        
        // Parse recipe data if available
        let ingredients = [];
        let instructions = [];
        if (recipe.metadata.attributes) {
            const ingredientsAttr = recipe.metadata.attributes.find(attr => attr.trait_type === 'ingredients');
            const instructionsAttr = recipe.metadata.attributes.find(attr => attr.trait_type === 'instructions');
            if (ingredientsAttr) ingredients = JSON.parse(ingredientsAttr.value || '[]');
            if (instructionsAttr) instructions = JSON.parse(instructionsAttr.value || '[]');
        }

        const createdDate = new Date(parseInt(recipe.createdAt) * 1000).toLocaleDateString();
        const priceUSDT = parseFloat(ethers.utils.formatEther(recipe.price || '0'));

        return `
            <div class="recipe-card user-recipe-card">
                <div class="recipe-image">
                    <img src="${imageUrl}" alt="${name}" onerror="this.src='https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg'">
                    <div class="recipe-status ${recipe.isActive ? 'active' : 'inactive'}">
                        ${recipe.isActive ? 'Active' : 'Inactive'}
                    </div>
                </div>
                <div class="recipe-info">
                    <h3>${name}</h3>
                    <p class="recipe-description">${description}</p>
                    
                    <div class="recipe-details">
                        <div class="detail-item">
                            <span class="label">Token ID:</span>
                            <span class="value">#${recipe.tokenId}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Created:</span>
                            <span class="value">${createdDate}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Price:</span>
                            <span class="value">${priceUSDT} USDT</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">For Sale:</span>
                            <span class="value ${recipe.isForSale ? 'for-sale' : 'not-for-sale'}">
                                ${recipe.isForSale ? 'Yes' : 'No'}
                            </span>
                        </div>
                    </div>

                    ${ingredients.length > 0 ? `
                        <div class="recipe-ingredients">
                            <h4>Ingredients:</h4>
                            <ul>
                                ${ingredients.slice(0, 3).map(ingredient => `<li>${ingredient}</li>`).join('')}
                                ${ingredients.length > 3 ? '<li>...</li>' : ''}
                            </ul>
                        </div>
                    ` : ''}

                    <div class="recipe-actions">
                        <button class="btn btn-secondary" onclick="userRecipeManager.viewRecipeDetails('${recipe.tokenId}')">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        <button class="btn btn-primary" onclick="userRecipeManager.openOnOpenSea('${recipe.tokenId}')">
                            <i class="fas fa-external-link-alt"></i> View on OpenSea
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // View recipe details in modal
    viewRecipeDetails(tokenId) {
        const recipe = this.userRecipes.find(r => r.tokenId === tokenId);
        if (!recipe) {
            console.error('Recipe not found:', tokenId);
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal recipe-detail-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${recipe.metadata.name || `Recipe NFT #${recipe.tokenId}`}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="recipe-detail-content">
                        <div class="recipe-image-large">
                            <img src="${recipe.metadata.image}" alt="${recipe.metadata.name}">
                        </div>
                        <div class="recipe-full-details">
                            <h3>Description</h3>
                            <p>${recipe.metadata.description}</p>
                            
                            <h3>Contract Information</h3>
                            <div class="contract-info">
                                <p><strong>Token ID:</strong> ${recipe.tokenId}</p>
                                <p><strong>Owner (ERC-6551 Account):</strong> ${recipe.idNFTAccount}</p>
                                <p><strong>ID NFT Token ID:</strong> ${recipe.idNFTTokenId}</p>
                                <p><strong>Token URI:</strong> <a href="${recipe.tokenURI}" target="_blank">${recipe.tokenURI}</a></p>
                            </div>

                            <h3>Status</h3>
                            <div class="status-info">
                                <p><strong>Active:</strong> ${recipe.isActive ? 'Yes' : 'No'}</p>
                                <p><strong>For Sale:</strong> ${recipe.isForSale ? 'Yes' : 'No'}</p>
                                <p><strong>Price:</strong> ${parseFloat(ethers.utils.formatEther(recipe.price || '0'))} USDT</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', () => modal.remove());
    }

    // Open NFT on OpenSea (if supported)
    openOnOpenSea(tokenId) {
        const contractAddress = APP_CONFIG.blockchain.recipeNft.address;
        const openseaUrl = `https://testnets.opensea.io/assets/ethereum/${contractAddress}/${tokenId}`;
        window.open(openseaUrl, '_blank');
    }

    // Add styles for user recipes
    addStyles() {
        if (document.getElementById('user-recipes-styles')) return;

        const style = document.createElement('style');
        style.id = 'user-recipes-styles';
        style.textContent = `
            .user-recipes-header {
                text-align: center;
                margin-bottom: 2rem;
            }

            .user-recipes-header h2 {
                color: #25f2f2;
                margin-bottom: 0.5rem;
            }

            .user-recipes-header p {
                color: #9ca3af;
                font-size: 0.9rem;
            }

            .user-recipes-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 2rem;
                margin-top: 2rem;
            }

            .user-recipe-card {
                background: rgba(31, 41, 55, 0.8);
                border: 1px solid rgba(55, 65, 81, 0.3);
                border-radius: 15px;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .user-recipe-card:hover {
                transform: translateY(-5px);
                border-color: #25f2f2;
                box-shadow: 0 10px 30px rgba(37, 242, 242, 0.1);
            }

            .recipe-status {
                position: absolute;
                top: 10px;
                right: 10px;
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.75rem;
                font-weight: bold;
            }

            .recipe-status.active {
                background: rgba(34, 197, 94, 0.2);
                color: #22c55e;
                border: 1px solid #22c55e;
            }

            .recipe-status.inactive {
                background: rgba(239, 68, 68, 0.2);
                color: #ef4444;
                border: 1px solid #ef4444;
            }

            .recipe-details {
                margin: 1rem 0;
            }

            .detail-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            }

            .detail-item .label {
                color: #9ca3af;
            }

            .detail-item .value {
                color: #f9fafb;
                font-weight: 500;
            }

            .detail-item .value.for-sale {
                color: #22c55e;
            }

            .detail-item .value.not-for-sale {
                color: #ef4444;
            }

            .recipe-ingredients {
                margin: 1rem 0;
            }

            .recipe-ingredients h4 {
                color: #25f2f2;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }

            .recipe-ingredients ul {
                list-style: none;
                padding: 0;
                font-size: 0.85rem;
                color: #9ca3af;
            }

            .recipe-ingredients li {
                padding: 0.25rem 0;
            }

            .recipe-actions {
                display: flex;
                gap: 0.75rem;
                margin-top: 1rem;
            }

            .recipe-actions .btn {
                flex: 1;
                padding: 0.5rem 1rem;
                font-size: 0.85rem;
            }

            .loading-state, .empty-state {
                text-align: center;
                padding: 3rem;
                color: #9ca3af;
            }

            .loading-state i {
                font-size: 2rem;
                color: #25f2f2;
                margin-bottom: 1rem;
            }

            .empty-state i {
                display: block;
                margin-bottom: 1rem;
            }

            .empty-state h3 {
                color: #f9fafb;
                margin-bottom: 0.5rem;
            }

            .recipe-detail-modal .modal-content {
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
            }

            .recipe-detail-content {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }

            .recipe-image-large img {
                width: 100%;
                border-radius: 10px;
            }

            .recipe-full-details h3 {
                color: #25f2f2;
                margin: 1.5rem 0 0.5rem 0;
            }

            .recipe-full-details h3:first-child {
                margin-top: 0;
            }

            .contract-info, .status-info {
                background: rgba(55, 65, 81, 0.3);
                padding: 1rem;
                border-radius: 8px;
                margin-top: 0.5rem;
            }

            .contract-info p, .status-info p {
                margin: 0.5rem 0;
                font-size: 0.9rem;
            }

            .contract-info a {
                color: #25f2f2;
                text-decoration: none;
                word-break: break-all;
            }

            .contract-info a:hover {
                text-decoration: underline;
            }

            @media (max-width: 768px) {
                .user-recipes-grid {
                    grid-template-columns: 1fr;
                }

                .recipe-detail-content {
                    grid-template-columns: 1fr;
                }

                .recipe-actions {
                    flex-direction: column;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Create global instance
const userRecipeManager = new UserRecipeManager();

// Auto-add styles when script loads
document.addEventListener('DOMContentLoaded', () => {
    userRecipeManager.addStyles();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserRecipeManager;
} else {
    window.userRecipeManager = userRecipeManager;
    window.UserRecipeManager = UserRecipeManager;
}