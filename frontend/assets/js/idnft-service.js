// ID NFT Service - 处理ID NFT相关的所有功能
class IDNFTService {
    constructor() {
        this.contractAddress = null;
        this.contract = null;
        this.provider = null;
        this.signer = null;
        this.contractABI = null;
        this.isInitialized = false;
    }

    // 初始化服务
    async initialize(contractAddress) {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not found');
            }

            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.contractAddress = contractAddress;

            // 简化的ABI，只包含我们需要的方法
            this.contractABI = [
                "function hasActiveIDNFT(address user) external view returns (bool)",
                "function getTokenIdByAddress(address user) external view returns (uint256)",
                "function getBarMetadata(uint256 tokenId) external view returns (tuple(string tokenURI, bool isActive, uint256 createdAt, uint256 updatedAt))",
                "function createIDNFT(address to, string uri) external returns (uint256)",
                "function ownerOf(uint256 tokenId) external view returns (address)",
                "function balanceOf(address owner) external view returns (uint256)"
            ];

            this.contract = new ethers.Contract(contractAddress, this.contractABI, this.signer);
            this.isInitialized = true;

            console.log('IDNFT Service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize IDNFT Service:', error);
            throw error;
        }
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

    // 获取ID NFT的元数据
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
}

// 全局实例
window.idnftService = new IDNFTService(); 