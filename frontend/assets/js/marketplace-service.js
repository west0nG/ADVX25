// Marketplace Service - Handle smart contract interactions for NFT purchases using INJ
class MarketplaceService {
    constructor() {
        this.marketplaceAddress = null;
        this.marketplaceContract = null;
        this.provider = null;
        this.signer = null;
        this.isInitialized = false;
        this.config = null;
    }

    // Initialize the marketplace service
    async initialize() {
        try {
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask not found');
            }

            // Get configuration
            this.config = window.APP_CONFIG || APP_CONFIG;
            if (!this.config?.blockchain?.marketplace) {
                throw new Error('Marketplace contract configuration not found');
            }

            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            
            // Marketplace contract
            this.marketplaceAddress = this.config.blockchain.marketplace.address;
            this.marketplaceContract = new ethers.Contract(
                this.marketplaceAddress, 
                this.getMarketplaceABI(), 
                this.signer
            );

            this.isInitialized = true;
            console.log('Marketplace Service initialized successfully');
            console.log('Marketplace Address:', this.marketplaceAddress);
            console.log('Using native INJ for payments');

            return true;
        } catch (error) {
            console.error('Failed to initialize Marketplace Service:', error);
            throw error;
        }
    }

    // Ensure service is initialized
    async ensureInitialized() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        return true;
    }

    // Get marketplace contract ABI
    getMarketplaceABI() {
        return [
            {
                "inputs": [
                    {"internalType": "uint256", "name": "recipeTokenId", "type": "uint256"}
                ],
                "name": "purchaseRecipeAuthorization",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "platformFeeRate",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "defaultAuthorizationDuration", 
                "outputs": [{"internalType": "uint64", "name": "", "type": "uint64"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }


    // Check user's INJ balance (native token)
    async getUserINJBalance(userAddress) {
        try {
            await this.ensureInitialized();
            const balance = await this.provider.getBalance(userAddress);
            return ethers.utils.formatEther(balance); // INJ uses 18 decimals like ETH
        } catch (error) {
            console.error('Error getting INJ balance:', error);
            throw error;
        }
    }

    // No allowance needed for native INJ - this method is kept for compatibility but returns max value
    async getINJAllowance(userAddress) {
        try {
            // Native tokens don't need allowance - return a large number to indicate unlimited allowance
            return ethers.constants.MaxUint256.toString();
        } catch (error) {
            console.error('Error in INJ allowance check:', error);
            throw error;
        }
    }

    // No approval needed for native INJ - this method is kept for compatibility but does nothing
    async approveINJ(amount) {
        try {
            console.log(`INJ is native token - no approval needed for ${amount} INJ`);
            // Return a dummy successful transaction-like object
            return { 
                hash: '0x0000000000000000000000000000000000000000000000000000000000000000',
                status: 1,
                gasUsed: ethers.BigNumber.from(0)
            };
        } catch (error) {
            console.error('Error in INJ approval (should not happen):', error);
            throw error;
        }
    }

    // Purchase recipe authorization using native INJ
    async purchaseRecipe(recipeTokenId, price) {
        try {
            await this.ensureInitialized();

            // Get user address
            const userAddress = await this.signer.getAddress();
            console.log(`Purchasing recipe ${recipeTokenId} for ${price} INJ...`);

            // Check INJ balance
            const balance = await this.getUserINJBalance(userAddress);
            if (parseFloat(balance) < parseFloat(price)) {
                throw new Error(`Insufficient INJ balance. Balance: ${balance}, Required: ${price}`);
            }

            // Convert price to wei (INJ uses 18 decimals)
            const priceInWei = ethers.utils.parseEther(price.toString());

            // Execute purchase using the correct function name and send INJ as value
            const tx = await this.marketplaceContract.purchaseRecipeAuthorization(recipeTokenId, {
                value: priceInWei
            });
            
            console.log('Purchase transaction sent:', tx.hash);
            const receipt = await tx.wait();
            
            console.log('Purchase successful:', receipt);
            return receipt;
        } catch (error) {
            console.error('Error purchasing recipe:', error);
            throw error;
        }
    }

    // Get platform fee rate
    async getPlatformFeeRate() {
        try {
            await this.ensureInitialized();
            const feeRate = await this.marketplaceContract.platformFeeRate();
            return feeRate.toNumber() / 10000; // Convert from basis points to decimal
        } catch (error) {
            console.error('Error getting platform fee rate:', error);
            return 0.025; // Default 2.5% if call fails
        }
    }

    // Calculate fees for a purchase
    async calculateFees(price) {
        try {
            const feeRate = await this.getPlatformFeeRate();
            const platformFee = parseFloat(price) * feeRate;
            const sellerAmount = parseFloat(price) - platformFee;
            
            return {
                price: parseFloat(price),
                platformFee: platformFee,
                sellerAmount: sellerAmount,
                feeRate: feeRate
            };
        } catch (error) {
            console.error('Error calculating fees:', error);
            // Return default calculation if contract call fails
            const feeRate = 0.025;
            const platformFee = parseFloat(price) * feeRate;
            const sellerAmount = parseFloat(price) - platformFee;
            
            return {
                price: parseFloat(price),
                platformFee: platformFee,
                sellerAmount: sellerAmount,
                feeRate: feeRate
            };
        }
    }

    // Format address for display
    getShortAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}

// Global instance
window.marketplaceService = new MarketplaceService(); 