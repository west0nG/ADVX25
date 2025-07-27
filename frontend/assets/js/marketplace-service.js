// Marketplace Service - Handle smart contract interactions for NFT purchases using USDT
class MarketplaceService {
    constructor() {
        this.marketplaceAddress = null;
        this.marketplaceContract = null;
        this.usdtAddress = null;
        this.usdtContract = null;
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
            if (!this.config?.blockchain?.marketplace || !this.config?.blockchain?.mockUsdt) {
                throw new Error('Marketplace or USDT contract configuration not found');
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

            // USDT contract  
            this.usdtAddress = this.config.blockchain.mockUsdt.address;
            this.usdtContract = new ethers.Contract(
                this.usdtAddress,
                this.getUSDTABI(),
                this.signer
            );

            this.isInitialized = true;
            console.log('Marketplace Service initialized successfully');
            console.log('Marketplace Address:', this.marketplaceAddress);
            console.log('USDT Address:', this.usdtAddress);

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

    // Get USDT contract ABI
    getUSDTABI() {
        return [
            {
                "inputs": [
                    {"internalType": "address", "name": "spender", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "address", "name": "owner", "type": "address"},
                    {"internalType": "address", "name": "spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "decimals",
                "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    // Check user's USDT balance
    async getUserUSDTBalance(userAddress) {
        try {
            await this.ensureInitialized();
            const balance = await this.usdtContract.balanceOf(userAddress);
            const decimals = await this.usdtContract.decimals();
            return ethers.utils.formatUnits(balance, decimals);
        } catch (error) {
            console.error('Error getting USDT balance:', error);
            throw error;
        }
    }

    // Check USDT allowance for marketplace
    async getUSDTAllowance(userAddress) {
        try {
            await this.ensureInitialized();
            const allowance = await this.usdtContract.allowance(userAddress, this.marketplaceAddress);
            const decimals = await this.usdtContract.decimals();
            return ethers.utils.formatUnits(allowance, decimals);
        } catch (error) {
            console.error('Error getting USDT allowance:', error);
            throw error;
        }
    }

    // Approve USDT spending by marketplace
    async approveUSDT(amount) {
        try {
            await this.ensureInitialized();
            const decimals = await this.usdtContract.decimals();
            const amountInWei = ethers.utils.parseUnits(amount.toString(), decimals);
            
            console.log(`Approving ${amount} USDT for marketplace...`);
            const tx = await this.usdtContract.approve(this.marketplaceAddress, amountInWei);
            const receipt = await tx.wait();
            
            console.log('USDT approval successful:', receipt);
            return receipt;
        } catch (error) {
            console.error('Error approving USDT:', error);
            throw error;
        }
    }

    // Purchase recipe authorization using USDT
    async purchaseRecipe(recipeTokenId, price) {
        try {
            await this.ensureInitialized();

            // Get user address
            const userAddress = await this.signer.getAddress();
            console.log(`Purchasing recipe ${recipeTokenId} for ${price} USDT...`);

            // Check USDT balance
            const balance = await this.getUserUSDTBalance(userAddress);
            if (parseFloat(balance) < parseFloat(price)) {
                throw new Error(`Insufficient USDT balance. Balance: ${balance}, Required: ${price}`);
            }

            // Check allowance
            const allowance = await this.getUSDTAllowance(userAddress);
            if (parseFloat(allowance) < parseFloat(price)) {
                console.log('Insufficient allowance, requesting approval...');
                await this.approveUSDT(price);
            }

            // Execute purchase using the correct function name (no value parameter)
            const tx = await this.marketplaceContract.purchaseRecipeAuthorization(recipeTokenId);
            
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