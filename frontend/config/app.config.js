// Application Configuration
const APP_CONFIG = {
    // App Information
    name: 'BarsHelpBars',
    version: '1.0.0',
    description: 'The Art of Cocktails, On-Chain',
    
    // API Configuration
    api: {
        baseUrl: 'http://localhost:8080', // Update this to your backend server URL
        timeout: 30000,
        retries: 3,
        endpoints: {
            recipes: {
                uploadIPFS: '/recipes/upload_ipfs',
                storeRecipe: '/recipes/store_recipe',
                getTenRecipes: '/recipes/get_ten_recipes',
                getAllRecipes: '/recipes/get_all_recipes',
                searchRecipes: '/recipes/search_recipes',
                getOneRecipe: '/recipes/get_one_recipe'
            }
        }
    },
    
    // Blockchain Configuration
    blockchain: {
        network: 'ethereum',
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        contractAddress: '0x...'
    },
    
    // UI Configuration
    ui: {
        theme: {
            primary: '#25f2f2',
            secondary: '#ec4899',
            background: '#0a0f1a',
            text: '#f9fafb',
            muted: '#9ca3af'
        },
        animations: {
            duration: 300,
            easing: 'ease-in-out'
        }
    },
    
    // Features
    features: {
        search: true,
        filters: true,
        pagination: true,
        imageUpload: true,
        walletConnection: true
    },
    
    // Pagination
    pagination: {
        itemsPerPage: 12,
        maxPages: 10
    },
    
    // File Upload
    upload: {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFiles: 1
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = APP_CONFIG;
} else {
    window.APP_CONFIG = APP_CONFIG;
} 