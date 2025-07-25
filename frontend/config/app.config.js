// Application Configuration
const APP_CONFIG = {
    // App Information
    name: 'BarsHelpBars',
    version: '1.0.0',
    description: '酒吧互助生态系统',
    
    // API Configuration
    api: {
        baseUrl: 'https://api.barshelpbars.com',
        timeout: 30000,
        retries: 3
    },
    
    // Blockchain Configuration
    blockchain: {
        network: 'ethereum',
        chainId: 1,
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
        contractAddress: '0x...',
        // ID NFT Contract Address (CA1)
        idnftContractAddress: '0x...', // 请填入部署的ID NFT合约地址
        // Sepolia Testnet Configuration
        sepolia: {
            chainId: '0xaa36a7',
            rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
            idnftContractAddress: '0x...' // 请填入Sepolia上的ID NFT合约地址
        }
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