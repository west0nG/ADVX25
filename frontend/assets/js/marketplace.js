// Marketplace functionality
document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header-placeholder');
        if (header && window.scrollY > 100) {
            header.classList.add('scrolled');
        } else if (header) {
            header.classList.remove('scrolled');
        }
    });

    // Variables for storing recipe data
    let nftData = [];
    let allRecipes = [];
    let currentPage = 1;
    let itemsPerPage = 12;
    let filteredNFTs = [];
    let isLoading = false;

    // Load recipes from backend
    async function loadRecipes() {
        try {
            isLoading = true;
            showLoadingState();
            
            // Try to get all recipes, fallback to ten recipes if all recipes fails
            let recipes;
            try {
                recipes = await apiService.getAllRecipes();
            } catch (error) {
                console.warn('Failed to get all recipes, trying to get ten recipes:', error);
                recipes = await apiService.getTenRecipes();
            }
            
            // Convert backend data format to frontend format
            allRecipes = recipes;
            nftData = transformRecipeData(recipes);
            filteredNFTs = [...nftData];
            
            hideLoadingState();
            renderNFTs();
            
        } catch (error) {
            console.error('Failed to load recipes:', error);
            showErrorState('Failed to load recipes. Using fallback data.');
            // Fallback to minimal mock data if API fails
            nftData = getFallbackData();
            filteredNFTs = [...nftData];
            hideLoadingState();
            renderNFTs();
        }
    }

    // Transform backend recipe data to frontend NFT format
    function transformRecipeData(recipes) {
        return recipes.map((recipe, index) => {
            // Parse cocktail_recipe if it's a JSON object
            let cocktailRecipe = recipe.cocktail_recipe;
            let category = recipe.category || "classic";
            
            if (typeof cocktailRecipe === 'object' && cocktailRecipe !== null) {
                // Extract category from JSON if available
                if (cocktailRecipe.category) {
                    category = cocktailRecipe.category;
                }
                
                // Format the recipe as readable text
                let recipeText = '';
                if (cocktailRecipe.ingredients && Array.isArray(cocktailRecipe.ingredients)) {
                    recipeText += 'Ingredients:\n' + cocktailRecipe.ingredients.map(ing => `- ${ing}`).join('\n');
                }
                if (cocktailRecipe.instructions && Array.isArray(cocktailRecipe.instructions)) {
                    if (recipeText) recipeText += '\n\n';
                    recipeText += 'Instructions:\n' + cocktailRecipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n');
                }
                cocktailRecipe = recipeText || 'Recipe details available';
            }

            return {
                id: index + 1,
                name: recipe.cocktail_name || 'Unnamed Recipe',
                image: formatImageUrl(recipe.cocktail_photo),
                price: formatPrice(recipe.price),
                creator: formatCreatorName(recipe.owner_address),
                creatorAvatar: getDefaultAvatar(),
                category: category,
                tokenId: formatTokenId(recipe.recipe_address, index),
                intro: recipe.cocktail_intro || '',
                recipe_address: recipe.recipe_address,
                owner_address: recipe.owner_address,
                user_addresses: recipe.user_address || [],
                cocktail_recipe: cocktailRecipe,
                nft_address: recipe.recipe_address // Use recipe_address as nft_address for compatibility
            };
        });
    }

    // Format image URL from cocktail_photo field
    function formatImageUrl(cocktailPhoto) {
        if (!cocktailPhoto) {
            return getDefaultImage();
        }
        
        // If it's already a URL, use it
        if (cocktailPhoto.startsWith('http')) {
            return cocktailPhoto;
        }
        
        // Handle IPFS protocol URLs
        if (cocktailPhoto.startsWith('ipfs://')) {
            const hash = cocktailPhoto.replace('ipfs://', '');
            return `https://gateway.pinata.cloud/ipfs/${hash}`;
        }
        
        // If it's a hex string, try to format as IPFS
        if (cocktailPhoto.startsWith('0x')) {
            // Remove 0x prefix and treat as IPFS hash
            const hash = cocktailPhoto.slice(2);
            return `https://gateway.pinata.cloud/ipfs/${hash}`;
        }
        
        // If it looks like an IPFS hash, format it
        if (cocktailPhoto.length > 40) {
            return `https://gateway.pinata.cloud/ipfs/${cocktailPhoto}`;
        }
        
        // Fallback to default image
        return getDefaultImage();
    }

    // Format price to display with proper decimals
    function formatPrice(price) {
        if (!price || price === 0) return "0.0";
        return typeof price === 'number' ? price.toFixed(2) : price.toString();
    }

    // Format creator name from owner address
    function formatCreatorName(ownerAddress) {
        if (!ownerAddress) return "@Unknown";
        // Format address to show first 6 and last 4 characters
        if (ownerAddress.length > 10) {
            return `@${ownerAddress.slice(0, 6)}...${ownerAddress.slice(-4)}`;
        }
        return `@${ownerAddress}`;
    }

    // Format token ID from recipe address
    function formatTokenId(recipeAddress, index) {
        if (!recipeAddress) {
            return String(index + 1).padStart(3, '0');
        }
        // Use last 4 characters of address as token ID
        return recipeAddress.slice(-4).toUpperCase();
    }

    // Get default image for recipes without images
    function getDefaultImage() {
        const defaultImages = [
            "https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg",
            "https://static.paraflowcontent.com/public/resource/image/e54f339e-235e-4246-a4f7-6cb0f21d2ca6.jpeg",
            "https://static.paraflowcontent.com/public/resource/image/48343c70-7eb5-4fa2-9816-f4ef4e162411.jpeg"
        ];
        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    }

    // Get default creator avatar
    function getDefaultAvatar() {
        return "https://static.paraflowcontent.com/public/resource/image/9ffa451d-8264-4d87-aad6-ae32c8965066.jpeg";
    }

    // Fallback data if API completely fails
    function getFallbackData() {
        return [
            {
                id: 1,
                name: "The Perfect Manhattan",
                image: "https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg",
                price: "0.58",
                creator: "@ClassicMixologist",
                creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/9ffa451d-8264-4d87-aad6-ae32c8965066.jpeg",
                category: "classic",
                tokenId: "024"
            },
            {
                id: 2,
            name: "Neon Dreams",
            image: "https://static.paraflowcontent.com/public/resource/image/e54f339e-235e-4246-a4f7-6cb0f21d2ca6.jpeg",
            price: "1.2",
            creator: "@FutureMix",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/92eb35ba-c295-406e-ba06-3ff38ef83dc8.jpeg",
            category: "modern",
            tokenId: "107"
        },
        {
            id: 3,
            name: "Island Paradise",
            image: "https://static.paraflowcontent.com/public/resource/image/48343c70-7eb5-4fa2-9816-f4ef4e162411.jpeg",
            price: "0.75",
            creator: "@TikiMaster",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/d5298df2-1d97-499a-b761-38a5a9db07ac.jpeg",
            category: "tropical",
            tokenId: "089"
        },
        {
            id: 4,
            name: "Midnight Espresso",
            image: "https://static.paraflowcontent.com/public/resource/image/332d64f2-579a-484c-995b-1079a0f9ca5f.jpeg",
            price: "0.45",
            creator: "@CoffeeAlchemist",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/9ffa451d-8264-4d87-aad6-ae32c8965066.jpeg",
            category: "non-alcoholic",
            tokenId: "156"
        },
        {
            id: 5,
            name: "Golden Sunset",
            image: "https://static.paraflowcontent.com/public/resource/image/ba8d3a63-545f-4315-84ed-cdec7398b05c.jpeg",
            price: "0.92",
            creator: "@SunsetMixer",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/92eb35ba-c295-406e-ba06-3ff38ef83dc8.jpeg",
            category: "tropical",
            tokenId: "203"
        },
        {
            id: 6,
            name: "Arctic Breeze",
            image: "https://static.paraflowcontent.com/public/resource/image/7f49f0a0-2563-4404-b3af-ed545f45f183.jpeg",
            price: "1.5",
            creator: "@IceMaster",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/d5298df2-1d97-499a-b761-38a5a9db07ac.jpeg",
            category: "modern",
            tokenId: "078"
        },
        {
            id: 7,
            name: "Smoky Whisper",
            image: "https://static.paraflowcontent.com/public/resource/image/8b4a2f6c-1823-4d9e-b547-2f8e9c4a6b7f.jpeg",
            price: "0.92",
            creator: "@WhiskeyMaster",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/3c7b1d9e-4f2a-6c8d-a9b1-5e3f7g9h1i2j.jpeg",
            category: "classic",
            tokenId: "156"
        },
        {
            id: 8,
            name: "Crystal Clarity",
            image: "https://static.paraflowcontent.com/public/resource/image/2b4d6f8h-0j1k-3l5m-7n9o-1p3q5r7s9t1u.jpeg",
            price: "2.1",
            creator: "@CrystalCraft",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/4f6h8j0l-2m4n-6o8p-0q2r-4s6t8u0v2w4x.jpeg",
            category: "modern",
            tokenId: "301"
        },
        {
            id: 9,
            name: "Ruby Fizz",
            image: "https://static.paraflowcontent.com/public/resource/image/6h8j0l2n-4o6p-8q0r-2s4t-6u8v0w2x4y6z.jpeg",
            price: "0.67",
            creator: "@RubyMixologist",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/8j0l2n4p-6q8r-0s2t-4u6v-8w0x2y4z6a8b.jpeg",
            category: "modern",
            tokenId: "145"
        },
        {
            id: 10,
            name: "Emerald Mist",
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
            price: "1.35",
            creator: "@EmeraldBarman",
            creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "289"
        },
        {
            id: 11,
            name: "Vintage Martini",
            image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop",
            price: "0.78",
            creator: "@VintageSoul",
            creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            category: "classic",
            tokenId: "067"
        },
        {
            id: 12,
            name: "Tropical Storm",
            image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
            price: "0.89",
            creator: "@StormMixer",
            creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "234"
        },
        {
            id: 13,
            name: "Lavender Dream",
            image: "https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=400&fit=crop",
            price: "0.56",
            creator: "@FloralMix",
            creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b2e12dff?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "178"
        },
        {
            id: 14,
            name: "Bourbon Blaze",
            image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
            price: "1.45",
            creator: "@BourbonKing",
            creatorAvatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face",
            category: "classic",
            tokenId: "456"
        },
        {
            id: 15,
            name: "Cucumber Zen",
            image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=400&fit=crop",
            price: "0.34",
            creator: "@ZenMaster",
            creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            category: "non-alcoholic",
            tokenId: "923"
        },
        {
            id: 16,
            name: "Passion Fruit Paradise",
            image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
            price: "0.82",
            creator: "@PassionMixer",
            creatorAvatar: "https://images.unsplash.com/photo-1464863979621-258859e62245?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "567"
        },
        {
            id: 17,
            name: "Midnight Oil",
            image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop",
            price: "1.67",
            creator: "@MidnightMixer",
            creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "789"
        },
        {
            id: 18,
            name: "Ginger Spark",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
            price: "0.43",
            creator: "@SpiceAlchemist",
            creatorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
            category: "non-alcoholic",
            tokenId: "345"
        },
        {
            id: 19,
            name: "Old Fashioned Royale",
            image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400&h=400&fit=crop",
            price: "1.23",
            creator: "@RoyalMixology",
            creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
            category: "classic",
            tokenId: "012"
        },
        {
            id: 20,
            name: "Electric Lime",
            image: "https://images.unsplash.com/photo-1541188495357-ad2dc89487f4?w=400&h=400&fit=crop",
            price: "0.91",
            creator: "@ElectricMix",
            creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "654"
        },
        {
            id: 21,
            name: "Coconut Breeze",
            image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56ce?w=400&h=400&fit=crop",
            price: "0.76",
            creator: "@CoconutKing",
            creatorAvatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "987"
        },
        {
            id: 22,
            name: "Herbal Elixir",
            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop",
            price: "0.52",
            creator: "@HerbalWizard",
            creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b2e12dff?w=100&h=100&fit=crop&crop=face",
            category: "non-alcoholic",
            tokenId: "321"
        },
        {
            id: 23,
            name: "Smoky Mezcal Dreams",
            image: "https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=400&fit=crop",
            price: "1.89",
            creator: "@MezcalMaestro",
            creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "111"
        },
        {
            id: 24,
            name: "Golden Margarita",
            image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
            price: "0.68",
            creator: "@MargaritaMaster",
            creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "222"
        }
        ];
    }

    // Loading and error state functions
    function showLoadingState() {
        const nftGrid = document.getElementById('nft-grid');
        if (nftGrid) {
            nftGrid.innerHTML = '<div class="loading-message">Loading recipes...</div>';
        }
    }

    function hideLoadingState() {
        // This will be handled by renderNFTs()
    }

    function showErrorState(message) {
        const nftGrid = document.getElementById('nft-grid');
        if (nftGrid) {
            nftGrid.innerHTML = `<div class="error-message">${message}</div>`;
        }
         }

    // Initialize marketplace
    async function initMarketplace() {
        await loadRecipes();
        setupFilters();
        setupSearch();
        setupPagination();
    }

    // Render NFTs
    function renderNFTs() {
        const nftGrid = document.getElementById('nft-grid');
        
        if (!nftGrid) {
            console.error('NFT grid element not found!');
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNFTs = filteredNFTs.slice(startIndex, endIndex);

        console.log('Rendering', pageNFTs.length, 'NFTs');

        nftGrid.innerHTML = '';
        nftGrid.classList.remove('visible');

        pageNFTs.forEach((nft, index) => {
            const nftCard = createNFTCard(nft);
            nftGrid.appendChild(nftCard);
            console.log('Added NFT card:', nft.name);
        });

        // Make cards visible immediately and add animation class
        nftGrid.classList.add('visible');
        
        // Force a reflow to ensure visibility
        nftGrid.offsetHeight;

        updatePagination();
    }

    // Create NFT card
    function createNFTCard(nft) {
        const card = document.createElement('div');
        card.className = 'nft-card';
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-price">${nft.price} INJ</div>
            </div>
            <div class="nft-info">
                <h3>${nft.name}</h3>
                <div class="nft-creator">
                    <img src="${nft.creatorAvatar}" alt="Creator" class="creator-avatar">
                    <span>${nft.creator}</span>
                    <span style="margin-left: auto; color: #9ca3af;">#${nft.tokenId}</span>
                </div>
            </div>
        `;

        // Add click event for NFT details
        card.addEventListener('click', () => {
            showNFTDetails(nft);
        });

        return card;
    }

    // Show NFT details modal
    async function showNFTDetails(nft) {
        // Create modal with loading state
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${nft.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading-message">Loading recipe details...</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Load detailed recipe data from backend
        try {
            let detailedRecipe = nft;
            
            // If we have NFT address, fetch detailed data
            if (nft.nft_address) {
                detailedRecipe = await apiService.getOneRecipe(nft.nft_address);
                // Merge with existing display data
                detailedRecipe = { ...nft, ...detailedRecipe };
            }

            // Update modal with full recipe details
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `
                <img src="${detailedRecipe.image}" alt="${detailedRecipe.name}" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                <div class="nft-details">
                    <p><strong>Creator:</strong> ${detailedRecipe.creator}</p>
                    <p><strong>Owner Address:</strong> <code>${detailedRecipe.owner_address || 'Unknown'}</code></p>
                    <p><strong>Recipe Address:</strong> <code>${detailedRecipe.recipe_address || 'Unknown'}</code></p>
                    <p><strong>Token ID:</strong> #${detailedRecipe.tokenId}</p>
                    <p><strong>Category:</strong> ${detailedRecipe.category}</p>
                    <p><strong>Price:</strong> ${detailedRecipe.price} INJ</p>
                    ${detailedRecipe.intro ? `<p><strong>Description:</strong> ${detailedRecipe.intro}</p>` : ''}
                    ${detailedRecipe.user_addresses && detailedRecipe.user_addresses.length > 0 ? `
                        <div class="recipe-section">
                            <h4>Authorized Users:</h4>
                            <ul>
                                ${detailedRecipe.user_addresses.map(addr => `<li><code>${addr}</code></li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${detailedRecipe.cocktail_recipe ? `
                        <div class="recipe-section">
                            <h4>Recipe Details:</h4>
                            <div class="recipe-content">
                                ${typeof detailedRecipe.cocktail_recipe === 'string' 
                                    ? `<p>${detailedRecipe.cocktail_recipe.replace(/\n/g, '<br>')}</p>`
                                    : '<p>Recipe details available upon purchase</p>'
                                }
                            </div>
                        </div>
                    ` : '<div class="recipe-section"><h4>Recipe:</h4><p>Recipe details will be available upon purchase</p></div>'}
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="window.open('${detailedRecipe.image}', '_blank')">View Full Image</button>
                    <button class="btn-primary" onclick="buyNFT('${detailedRecipe.tokenId}', '${detailedRecipe.price}', '${detailedRecipe.name}')">Buy Now - ${detailedRecipe.price} INJ</button>
                </div>
            `;

        } catch (error) {
            console.error('Failed to load recipe details:', error);
            const modalBody = modal.querySelector('.modal-body');
            modalBody.innerHTML = `
                <img src="${nft.image}" alt="${nft.name}" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                <div class="nft-details">
                    <p><strong>Creator:</strong> ${nft.creator}</p>
                    <p><strong>Owner Address:</strong> <code>${nft.owner_address || 'Unknown'}</code></p>
                    <p><strong>Recipe Address:</strong> <code>${nft.recipe_address || 'Unknown'}</code></p>
                    <p><strong>Token ID:</strong> #${nft.tokenId}</p>
                    <p><strong>Category:</strong> ${nft.category}</p>
                    <p><strong>Price:</strong> ${nft.price} INJ</p>
                    ${nft.intro ? `<p><strong>Description:</strong> ${nft.intro}</p>` : ''}
                    <p class="error-message">Could not load detailed recipe information</p>
                </div>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="window.open('${nft.image}', '_blank')">View Full Image</button>
                    <button class="btn-primary" onclick="buyNFT('${nft.tokenId}', '${nft.price}', '${nft.name}')">Buy Now - ${nft.price} INJ</button>
                </div>
            `;
                 }

        // Add modal to page
        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', () => modal.remove());

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
            }
            .modal-content {
                background: rgba(31, 41, 55, 0.95);
                border-radius: 20px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                position: relative;
                border: 1px solid rgba(55, 65, 81, 0.3);
            }
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
            }
            .modal-close {
                background: none;
                border: none;
                color: #9ca3af;
                font-size: 2rem;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .modal-close:hover {
                color: #25f2f2;
            }
            .nft-details {
                margin: 1rem 0;
            }
            .nft-details p {
                margin-bottom: 0.5rem;
                color: #9ca3af;
            }
            .modal-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
            }
            .fee-breakdown {
                background: rgba(55, 65, 81, 0.5);
                padding: 1rem;
                border-radius: 10px;
                margin-bottom: 1rem;
            }
            .fee-breakdown h4 {
                color: #25f2f2;
                margin-bottom: 0.5rem;
            }
            .fee-breakdown p {
                margin: 0.25rem 0;
                color: #d1d5db;
            }
            .success-message {
                text-align: center;
                color: #10b981;
            }
            .success-message h4 {
                color: #10b981;
                margin-bottom: 1rem;
            }
            .success-message code {
                background: rgba(55, 65, 81, 0.5);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                word-break: break-all;
                display: block;
                margin: 0.5rem 0;
            }
            .error-message {
                text-align: center;
                color: #ef4444;
            }
            .error-message h4 {
                color: #ef4444;
                margin-bottom: 1rem;
            }
            .loading-message {
                text-align: center;
                color: #9ca3af;
                padding: 2rem;
            }
        `;
        document.head.appendChild(style);
    }

    // Setup filters
    function setupFilters() {
        const filterOptions = document.querySelectorAll('.filter-option');
        const sortSelect = document.querySelector('.sort-select');

        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options in the same group
                const group = option.closest('.filter-options');
                group.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                applyFilters();
            });
        });

        sortSelect.addEventListener('change', applyFilters);
    }

    // Apply filters
    function applyFilters() {
        const categoryFilter = document.querySelector('.filter-option[data-category].active').dataset.category;
        const priceFilter = document.querySelector('.filter-option[data-price].active').dataset.price;
        const sortBy = document.querySelector('.sort-select').value;

        // Filter by category
        filteredNFTs = nftData.filter(nft => {
            if (categoryFilter !== 'all' && nft.category !== categoryFilter) return false;
            return true;
        });

        // Filter by price
        if (priceFilter !== 'all') {
            const [min, max] = priceFilter.split('-').map(Number);
            filteredNFTs = filteredNFTs.filter(nft => {
                const price = parseFloat(nft.price);
                if (max) {
                    return price >= min && price < max;
                } else {
                    return price >= min;
                }
            });
        }

        // Sort
        filteredNFTs.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-high':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'oldest':
                    return a.id - b.id;
                case 'newest':
                    return b.id - a.id;
                default:
                    return 0;
            }
        });

        currentPage = 1;
        renderNFTs();
    }

    // Setup search
    function setupSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) {
            console.log('Search box not found, skipping search setup');
            return;
        }
        
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(async () => {
                const searchTerm = e.target.value.trim();
                
                if (searchTerm) {
                    try {
                        showLoadingState();
                        const searchResults = await apiService.searchRecipes(searchTerm);
                        filteredNFTs = transformRecipeData(searchResults);
                        hideLoadingState();
                    } catch (error) {
                        console.error('Search failed:', error);
                        // Fallback to client-side search
                        filteredNFTs = nftData.filter(nft => 
                            nft.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            nft.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            nft.category.toLowerCase().includes(searchTerm.toLowerCase())
                        );
                        hideLoadingState();
                    }
                } else {
                    filteredNFTs = [...nftData];
                }

                currentPage = 1;
                renderNFTs();
            }, 300);
        });
    }

    // Setup pagination
    function setupPagination() {
        const pagination = document.querySelector('.pagination');
        
        pagination.addEventListener('click', (e) => {
            // Handle clicks on buttons, their child elements (like icons), or page dots
            const button = e.target.closest('.page-btn');
            if (button) {
                const page = button.dataset.page;
                
                if (page === 'prev' && currentPage > 1) {
                    currentPage--;
                    renderNFTs();
                } else if (page === 'next' && currentPage < Math.ceil(filteredNFTs.length / itemsPerPage)) {
                    currentPage++;
                    renderNFTs();
                } else if (page !== 'prev' && page !== 'next' && !isNaN(parseInt(page))) {
                    currentPage = parseInt(page);
                    renderNFTs();
                }
            }
        });
    }

    // Update pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredNFTs.length / itemsPerPage);
        const pageNumbers = document.querySelector('.page-numbers');
        const prevBtn = document.querySelector('.page-btn[data-page="prev"]');
        const nextBtn = document.querySelector('.page-btn[data-page="next"]');

        // Update page numbers
        if (pageNumbers) {
            pageNumbers.innerHTML = '';
            
            if (totalPages <= 7) {
                // Show all pages if 7 or fewer
                for (let i = 1; i <= totalPages; i++) {
                    const btn = document.createElement('button');
                    btn.className = 'page-btn';
                    btn.dataset.page = i;
                    btn.textContent = i;
                    if (i === currentPage) btn.classList.add('active');
                    pageNumbers.appendChild(btn);
                }
            } else {
                // Show truncated pagination
                const addPageBtn = (pageNum) => {
                    const btn = document.createElement('button');
                    btn.className = 'page-btn';
                    btn.dataset.page = pageNum;
                    btn.textContent = pageNum;
                    if (pageNum === currentPage) btn.classList.add('active');
                    pageNumbers.appendChild(btn);
                };

                const addDots = () => {
                    const dots = document.createElement('span');
                    dots.className = 'page-dots';
                    dots.textContent = '...';
                    pageNumbers.appendChild(dots);
                };

                // Always show first page
                addPageBtn(1);

                if (currentPage > 3) {
                    addDots();
                }

                // Show pages around current page
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(totalPages - 1, currentPage + 1);
                
                for (let i = start; i <= end; i++) {
                    addPageBtn(i);
                }

                if (currentPage < totalPages - 2) {
                    addDots();
                }

                // Always show last page (if more than 1 page)
                if (totalPages > 1) {
                    addPageBtn(totalPages);
                }
            }
        }

        // Update prev/next buttons
        if (prevBtn) {
            prevBtn.disabled = currentPage === 1;
            prevBtn.style.opacity = prevBtn.disabled ? '0.5' : '1';
        }
        
        if (nextBtn) {
            nextBtn.disabled = currentPage === totalPages || totalPages === 0;
            nextBtn.style.opacity = nextBtn.disabled ? '0.5' : '1';
        }
    }

    // Buy NFT function - handles the purchase transaction
    window.buyNFT = async function(tokenId, price, recipeName) {
        try {
            // Check if MetaMask is available
            if (typeof window.ethereum === 'undefined') {
                alert('Please install MetaMask to purchase NFTs');
                return;
            }

            // Request wallet connection
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Get user address
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
                alert('Please connect your wallet to purchase NFTs');
                return;
            }
            const userAddress = accounts[0];

            // Check if user has active ID NFT
            try {
                // Ensure IDNFT service is available
                if (!window.idnftService) {
                    console.error('IDNFT service not found on window object');
                    alert('ID NFT service is not available. Please refresh the page and try again.');
                    return;
                }
                
                console.log('IDNFT service found, initializing...');
                await window.idnftService.ensureInitialized();
                console.log('IDNFT service initialized, checking user ID NFT...');
                
                const idnftResult = await window.idnftService.checkUserIDNFT(userAddress);
                if (!idnftResult.hasActive) {
                    alert('You need an active ID NFT to purchase recipes. Please mint an ID NFT first.');
                    return;
                }
                console.log('User has active ID NFT:', idnftResult);
            } catch (error) {
                console.error('Error checking ID NFT:', error);
                alert('Error checking ID NFT status: ' + error.message + '. Please refresh the page and try again.');
                return;
            }

            // Show loading modal
            const loadingModal = showBuyingModal(recipeName, price);

            try {
                // Initialize marketplace service
                await window.marketplaceService.ensureInitialized();

                // Convert tokenId to number for contract call
                // Since tokenId is formatted from recipe address, we need to use a numeric ID
                // For now, we'll use a simple mapping based on the tokenId or default to 1
                let recipeTokenId = 1;
                if (tokenId && !isNaN(parseInt(tokenId))) {
                    recipeTokenId = parseInt(tokenId);
                } else if (tokenId) {
                    // If tokenId is a hex string (last 4 chars of address), convert to number
                    recipeTokenId = parseInt(tokenId, 16) % 1000 + 1; // Keep within reasonable range
                }
                
                // Calculate fees
                updateBuyingModal(loadingModal, 'Calculating fees...');
                const fees = await window.marketplaceService.calculateFees(price);

                // Show fee breakdown
                updateBuyingModal(loadingModal, `
                    <div class="fee-breakdown">
                        <h4>Purchase Summary</h4>
                        <p><strong>Recipe:</strong> ${recipeName}</p>
                        <p><strong>Price:</strong> ${fees.price} INJ</p>
                        <p><strong>Platform Fee (${(fees.feeRate * 100).toFixed(2)}%):</strong> ${fees.platformFee.toFixed(6)} INJ</p>
                        <p><strong>Seller Receives:</strong> ${fees.sellerAmount.toFixed(6)} INJ</p>
                    </div>
                    <p>Checking INJ balance...</p>
                `);

                // Check user's INJ balance
                const balance = await window.marketplaceService.getUserINJBalance(userAddress);
                if (parseFloat(balance) < parseFloat(price)) {
                    updateBuyingModal(loadingModal, `
                        <div class="error-message">
                            <h4>Insufficient Balance</h4>
                            <p>Your INJ balance: ${parseFloat(balance).toFixed(6)} INJ</p>
                            <p>Required: ${price} INJ</p>
                            <p>Please add more INJ to your wallet and try again.</p>
                            <button class="btn-primary" onclick="closeBuyingModal('${loadingModal.id}')" style="margin-top: 1rem;">Close</button>
                        </div>
                    `);
                    return;
                }

                // Execute purchase
                updateBuyingModal(loadingModal, 'Processing purchase...');
                const receipt = await window.marketplaceService.purchaseRecipe(recipeTokenId, price);

                // Show success
                updateBuyingModal(loadingModal, `
                    <div class="success-message">
                        <h4>✅ Purchase Successful!</h4>
                        <p>You have successfully purchased access to <strong>${recipeName}</strong></p>
                        <p><strong>Transaction Hash:</strong></p>
                        <p><code>${receipt.transactionHash}</code></p>
                        <p>You now have authorization to view and use this recipe!</p>
                        <button class="btn-primary" onclick="closeBuyingModal('${loadingModal.id}')" style="margin-top: 1rem;">Close</button>
                    </div>
                `);

                // Sync with backend
                try {
                    await apiService.completeTransaction({
                        recipe_address: tokenId,
                        buyer_address: userAddress,
                        transaction_hash: receipt.transactionHash,
                        price: price
                    });
                } catch (backendError) {
                    console.error('Failed to sync transaction with backend:', backendError);
                }

            } catch (purchaseError) {
                console.error('Purchase failed:', purchaseError);
                let errorMessage = 'Purchase failed. Please try again.';
                
                if (purchaseError.message.includes('user rejected')) {
                    errorMessage = 'Transaction cancelled by user.';
                } else if (purchaseError.message.includes('insufficient')) {
                    errorMessage = 'Insufficient balance or allowance.';
                } else if (purchaseError.message.includes('active ID NFT')) {
                    errorMessage = 'You need an active ID NFT to make purchases.';
                } else if (purchaseError.message.includes('own recipe')) {
                    errorMessage = 'You cannot purchase your own recipe.';
                }

                updateBuyingModal(loadingModal, `
                    <div class="error-message">
                        <h4>❌ Purchase Failed</h4>
                        <p>${errorMessage}</p>
                        <button class="btn-primary" onclick="closeBuyingModal('${loadingModal.id}')" style="margin-top: 1rem;">Close</button>
                    </div>
                `);
            }

        } catch (error) {
            console.error('Error during purchase:', error);
            alert('An error occurred during purchase. Please check the console for details.');
        }
    };

    // Show buying modal
    function showBuyingModal(recipeName, price) {
        const modalId = 'buying-modal-' + Date.now();
        const modal = document.createElement('div');
        modal.id = modalId;
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Purchasing ${recipeName}</h2>
                </div>
                <div class="modal-body">
                    <div class="loading-message">Initializing purchase...</div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        return modal;
    }

    // Update buying modal content
    function updateBuyingModal(modal, content) {
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = content;
    }

    // Close buying modal
    window.closeBuyingModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    };

    // Initialize
    initMarketplace();
}); 