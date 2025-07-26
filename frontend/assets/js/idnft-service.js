// ID NFT Service - 处理ID NFT相关的所有功能
class IDNFTService {
    constructor() {
        this.contractAddress = null;
        this.contract = null;
        this.provider = null;
        this.signer = null;
        this.contractABI = null;
        this.isInitialized = false;
        this.config = null;
    }

    // Wait for ethers library to be loaded
    waitForEthers() {
        return new Promise((resolve, reject) => {
            console.log('Checking for ethers library...');
            
            // Check if ethers is already available
            if (typeof ethers !== 'undefined' && ethers.providers) {
                console.log('Ethers library found immediately');
                resolve();
                return;
            }

            let attempts = 0;
            const maxAttempts = 100; // 10 seconds with 100ms intervals
            
            const checkEthers = setInterval(() => {
                attempts++;
                console.log(`Checking for ethers... attempt ${attempts}/${maxAttempts}`);
                
                if (typeof ethers !== 'undefined' && ethers.providers) {
                    clearInterval(checkEthers);
                    console.log('Ethers library loaded successfully');
                    resolve();
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkEthers);
                    console.error('Ethers library failed to load after', attempts, 'attempts');
                    reject(new Error('Ethers library could not be loaded'));
                }
            }, 100);
        });
    }

    // 初始化服务 - 使用配置中的合约地址和ABI
    async initialize() {
        try {
            console.log('Initializing IDNFT Service...');
            
            // Wait for ethers library to be loaded
            try {
                await this.waitForEthers();
            } catch (ethersError) {
                console.error('Ethers loading failed:', ethersError);
                // Try to reload ethers from a different CDN as fallback
                console.log('Attempting to load ethers from alternative CDN...');
                await this.loadEthersAsFallback();
            }
            
            if (typeof ethers === 'undefined' || !ethers.providers) {
                throw new Error('Ethers library is not available. Please refresh the page and ensure you have a stable internet connection.');
            }

            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not found. Please install MetaMask to continue.');
            }

            // 获取配置
            this.config = window.APP_CONFIG || APP_CONFIG;
            if (!this.config?.blockchain?.idNft) {
                throw new Error('ID NFT contract configuration not found in APP_CONFIG');
            }

            console.log('Creating ethers provider...');
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.contractAddress = this.config.blockchain.idNft.address;
            this.contractABI = this.config.blockchain.idNft.abi;

            console.log('Creating contract instance for address:', this.contractAddress);
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.signer);
            this.isInitialized = true;

            console.log('IDNFT Service initialized successfully with address:', this.contractAddress);
            return true;
        } catch (error) {
            console.error('Failed to initialize IDNFT Service:', error);
            this.isInitialized = false;
            throw error;
        }
    }

    // Fallback method to load ethers from alternative CDN
    async loadEthersAsFallback() {
        return new Promise((resolve, reject) => {
            console.log('Loading ethers from alternative CDN...');
            
            // Remove existing ethers script if any
            const existingScript = document.querySelector('script[src*="ethers"]');
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js';
            script.onload = () => {
                console.log('Alternative ethers CDN loaded successfully');
                // Wait a bit for ethers to be fully available
                setTimeout(() => {
                    if (typeof ethers !== 'undefined' && ethers.providers) {
                        resolve();
                    } else {
                        reject(new Error('Ethers still not available after fallback load'));
                    }
                }, 500);
            };
            script.onerror = () => {
                console.error('Failed to load ethers from alternative CDN');
                reject(new Error('All ethers CDN sources failed'));
            };
            
            document.head.appendChild(script);
        });
    }

    // Ensure service is initialized
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return true;
    }

    // 向后兼容的初始化方法
    async initializeWithAddress(contractAddress) {
        console.warn('initializeWithAddress is deprecated, use initialize() instead');
        return await this.initialize();
    }

    // 检查用户是否拥有活跃的ID NFT
    async checkUserIDNFT(userAddress) {
        try {
            if (!this.isInitialized) {
                throw new Error('Service not initialized');
            }

            const hasActive = await this.contract.hasActiveIDNFT(userAddress);
            const tokenId = await this.contract.getTokenIdByAddress(userAddress);

            return {
                hasActive,
                tokenId: tokenId.toString(),
                exists: tokenId > 0
            };
        } catch (error) {
            console.error('Error checking user ID NFT:', error);
            throw error;
        }
    }

    // Alias method for backward compatibility
    async checkUserHasIDNFT(userAddress) {
        try {
            const result = await this.checkUserIDNFT(userAddress);
            return result.hasActive;
        } catch (error) {
            console.error('Error checking user has ID NFT:', error);
            throw error;
        }
    }

    // Get user's token ID
    async getUserTokenId(userAddress) {
        try {
            if (!this.isInitialized) {
                throw new Error('Service not initialized');
            }

            const tokenId = await this.contract.getTokenIdByAddress(userAddress);
            return tokenId.toString();
        } catch (error) {
            console.error('Error getting user token ID:', error);
            throw error;
        }
    }

    // Get address by token ID
    async getAddressByTokenId(tokenId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Service not initialized');
            }

            const address = await this.contract.getAddressByTokenId(tokenId);
            return address;
        } catch (error) {
            console.error('Error getting address by token ID:', error);
            throw error;
        }
    }

    // Get ID NFT metadata
    async getIDNFTMetadata(tokenId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Service not initialized');
            }

            const metadata = await this.contract.getBarMetadata(tokenId);
            return {
                tokenURI: metadata.tokenURI,
                isActive: metadata.isActive,
                createdAt: new Date(metadata.createdAt * 1000),
                updatedAt: new Date(metadata.updatedAt * 1000)
            };
        } catch (error) {
            console.error('Error getting ID NFT metadata:', error);
            throw error;
        }
    }

    // Alias for backward compatibility
    async getBarMetadata(tokenId) {
        return this.getIDNFTMetadata(tokenId);
    }

    // 创建ID NFT（空投）
    async createIDNFT(userAddress, metadataURI) {
        try {
            if (!this.isInitialized) {
                throw new Error('Service not initialized');
            }

            // 注意：这个函数只能由合约所有者调用
            // 在实际应用中，这通常通过后端API来完成
            const tx = await this.contract.createIDNFT(userAddress, metadataURI);
            const receipt = await tx.wait();

            console.log('ID NFT created successfully:', receipt);
            return receipt;
        } catch (error) {
            console.error('Error creating ID NFT:', error);
            throw error;
        }
    }

    // 验证合约地址格式
    isValidContractAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    // 获取短地址格式
    getShortAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    // Get ERC-6551 account address for a token ID
    async getAccountAddress(tokenId) {
        try {
            if (!this.isInitialized) {
                throw new Error('Service not initialized');
            }

            const accountAddress = await this.contract.getAccountAddress(tokenId);
            return accountAddress;
        } catch (error) {
            console.error('Error getting account address:', error);
            throw error;
        }
    }
}

// 全局实例 - 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, creating IDNFT service...');
    window.idnftService = new IDNFTService();
    console.log('IDNFT service created and attached to window');
});

// 如果DOM已经加载完成，立即创建实例
if (document.readyState === 'loading') {
    // DOM还在加载中，等待DOMContentLoaded事件
} else {
    // DOM已经加载完成，立即创建实例
    console.log('DOM already loaded, creating IDNFT service immediately...');
    window.idnftService = new IDNFTService();
} 