/**
 * WalletService - Centralized MetaMask interaction service
 * Handles all wallet connections, state management, and event listeners
 */
class WalletService {
    constructor() {
        // Connection state machine
        this.connectionState = 'IDLE'; // IDLE, CONNECTING, CONNECTED, ERROR
        this.connectionPromise = null;
        
        // Wallet state
        this.currentAccount = null;
        this.currentChainId = null;
        
        // Event listener management
        this.metamaskListeners = {};
        this.abortController = new AbortController();
        
        // Configuration
        this.SUPPORTED_CHAINS = {
            '0x1': { name: 'Ethereum Mainnet', id: 1 },
            '0x89': { name: 'Polygon', id: 137 },
            '0xaa36a7': { name: 'Sepolia Testnet', id: 11155111 },
            '0x5': { name: 'Goerli Testnet', id: 5 }
        };
        
        // Initialize service (async)
        this.initializeAsync();
    }

    /**
     * Initialize the service asynchronously
     */
    async initializeAsync() {
        this.initializationPromise = this.initialize();
        try {
            await this.initializationPromise;
        } catch (error) {
            console.error('WalletService initialization failed:', error);
        }
    }

    /**
     * Ensure service is ready
     */
    async ensureReady() {
        if (this.initializationPromise) {
            await this.initializationPromise;
        }
        return this;
    }

    /**
     * Initialize the service and validate stored state
     */
    async initialize() {
        if (!this.isMetaMaskAvailable()) {
            console.log('MetaMask not available');
            return;
        }

        // Setup cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup(), { signal: this.abortController.signal });
        
        // Validate stored state
        await this.validateStoredState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start periodic state validation
        this.startStateValidation();
    }

    /**
     * Check if MetaMask is available
     */
    isMetaMaskAvailable() {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    }

    /**
     * Validate stored authentication state
     */
    async validateStoredState() {
        const storedAddress = localStorage.getItem('walletAddress');
        if (!storedAddress) return;

        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const currentAddress = accounts[0]?.toLowerCase();
            const storedAddressLower = storedAddress.toLowerCase();

            if (!currentAddress || currentAddress !== storedAddressLower) {
                // Mismatch detected - clear invalid state
                console.log('Stored state mismatch detected, clearing...');
                this.clearStoredState();
            } else {
                // Valid state - update current account
                this.currentAccount = currentAddress;
                this.connectionState = 'CONNECTED';
                
                // Get current chain
                const chainId = await window.ethereum.request({ method: 'eth_chainId' });
                this.currentChainId = chainId;
            }
        } catch (error) {
            console.error('Error validating stored state:', error);
            this.clearStoredState();
        }
    }

    /**
     * Setup MetaMask event listeners with proper cleanup
     */
    setupEventListeners() {
        if (!this.isMetaMaskAvailable()) return;

        // Account changes
        const accountsChangedHandler = (accounts) => {
            if (accounts.length === 0) {
                // User disconnected
                this.handleDisconnect();
            } else {
                // Account switched
                const newAccount = accounts[0].toLowerCase();
                if (newAccount !== this.currentAccount) {
                    this.handleAccountChange(newAccount);
                }
            }
        };

        // Chain changes
        const chainChangedHandler = (chainId) => {
            this.handleChainChange(chainId);
        };

        // Disconnect
        const disconnectHandler = (error) => {
            console.log('MetaMask disconnected:', error);
            this.handleDisconnect();
        };

        // Store listeners for cleanup
        this.metamaskListeners = {
            accountsChanged: accountsChangedHandler,
            chainChanged: chainChangedHandler,
            disconnect: disconnectHandler
        };

        // Register listeners
        window.ethereum.on('accountsChanged', accountsChangedHandler);
        window.ethereum.on('chainChanged', chainChangedHandler);
        window.ethereum.on('disconnect', disconnectHandler);
    }

    /**
     * Remove all MetaMask event listeners
     */
    removeAllListeners() {
        if (!this.isMetaMaskAvailable() || !this.metamaskListeners) return;

        Object.entries(this.metamaskListeners).forEach(([event, handler]) => {
            window.ethereum.removeListener(event, handler);
        });

        this.metamaskListeners = {};
    }

    /**
     * Connect to MetaMask with proper error handling and race condition prevention
     */
    async connect() {
        // Ensure service is fully initialized
        await this.ensureReady();
        
        // Prevent multiple simultaneous connection attempts
        if (this.connectionState === 'CONNECTING') {
            return this.connectionPromise;
        }

        if (!this.isMetaMaskAvailable()) {
            throw new Error('METAMASK_NOT_FOUND');
        }

        this.connectionState = 'CONNECTING';

        // Create connection promise with timeout
        this.connectionPromise = Promise.race([
            this._performConnection(),
            this._createTimeout(30000) // 30 second timeout
        ]);

        try {
            const result = await this.connectionPromise;
            this.connectionState = 'CONNECTED';
            return result;
        } catch (error) {
            this.connectionState = 'ERROR';
            throw error;
        } finally {
            this.connectionPromise = null;
        }
    }

    /**
     * Perform the actual connection
     */
    async _performConnection() {
        try {
            // Request accounts
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('NO_ACCOUNTS_RETURNED');
            }

            const account = accounts[0].toLowerCase();
            this.currentAccount = account;

            // Get current chain
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            this.currentChainId = chainId;

            // Validate network
            if (!this.SUPPORTED_CHAINS[chainId]) {
                throw new Error('UNSUPPORTED_NETWORK');
            }

            // Store connection info
            this.updateStoredState(account);

            // Notify UI of successful connection
            window.dispatchEvent(new CustomEvent('walletConnected', {
                detail: { account, chainId }
            }));

            return { account, chainId };
        } catch (error) {
            throw this.categorizeError(error);
        }
    }

    /**
     * Create a timeout promise
     */
    _createTimeout(ms) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('CONNECTION_TIMEOUT')), ms);
        });
    }

    /**
     * Categorize and enhance error messages
     */
    categorizeError(error) {
        const errorMap = {
            4001: {
                type: 'USER_REJECTED',
                message: 'Please approve the connection request in MetaMask',
                recoverable: true
            },
            '-32002': {
                type: 'REQUEST_PENDING',
                message: 'A request is already pending. Please check your MetaMask extension',
                recoverable: true
            },
            '-32603': {
                type: 'INTERNAL_ERROR',
                message: 'Internal error occurred. Please try refreshing the page',
                recoverable: true
            },
            'METAMASK_NOT_FOUND': {
                type: 'NOT_INSTALLED',
                message: 'MetaMask is not installed. Please install the browser extension',
                recoverable: false
            },
            'NO_ACCOUNTS_RETURNED': {
                type: 'NO_ACCOUNTS',
                message: 'No accounts found. Please create or unlock your MetaMask wallet',
                recoverable: true
            },
            'UNSUPPORTED_NETWORK': {
                type: 'WRONG_NETWORK',
                message: 'Please switch to a supported network (Ethereum, Polygon, or Sepolia)',
                recoverable: true
            },
            'CONNECTION_TIMEOUT': {
                type: 'TIMEOUT',
                message: 'Connection timed out. Please try again',
                recoverable: true
            }
        };

        const errorCode = error.code || error.message;
        const errorInfo = errorMap[errorCode] || {
            type: 'UNKNOWN_ERROR',
            message: error.message || 'An unknown error occurred',
            recoverable: true
        };

        const enhancedError = new Error(errorInfo.message);
        enhancedError.type = errorInfo.type;
        enhancedError.recoverable = errorInfo.recoverable;
        enhancedError.originalError = error;

        return enhancedError;
    }

    /**
     * Disconnect wallet
     */
    disconnect() {
        this.currentAccount = null;
        this.currentChainId = null;
        this.connectionState = 'IDLE';
        this.clearStoredState();

        // Notify UI
        window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }

    /**
     * Handle account change
     */
    handleAccountChange(newAccount) {
        this.currentAccount = newAccount;
        this.updateStoredState(newAccount);

        // Notify UI
        window.dispatchEvent(new CustomEvent('accountChanged', {
            detail: { account: newAccount }
        }));
    }

    /**
     * Handle chain change
     */
    handleChainChange(chainId) {
        this.currentChainId = chainId;

        // Check if supported
        if (!this.SUPPORTED_CHAINS[chainId]) {
            window.dispatchEvent(new CustomEvent('unsupportedNetwork', {
                detail: { chainId }
            }));
        } else {
            window.dispatchEvent(new CustomEvent('chainChanged', {
                detail: { chainId, network: this.SUPPORTED_CHAINS[chainId] }
            }));
        }
    }

    /**
     * Handle disconnect
     */
    handleDisconnect() {
        this.disconnect();
    }

    /**
     * Update stored authentication state
     */
    updateStoredState(account) {
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('walletAddress', account);
        localStorage.setItem('walletType', 'metamask');
        localStorage.setItem('connectionTime', new Date().toISOString());
    }

    /**
     * Clear stored authentication state
     */
    clearStoredState() {
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');
        localStorage.removeItem('connectionTime');
    }

    /**
     * Start periodic state validation
     */
    startStateValidation() {
        // Validate state every 30 seconds
        this.validationInterval = setInterval(() => {
            if (this.connectionState === 'CONNECTED') {
                this.validateStoredState();
            }
        }, 30000);
    }

    /**
     * Switch to a supported network
     */
    async switchNetwork(chainId) {
        if (!this.SUPPORTED_CHAINS[chainId]) {
            throw new Error('Unsupported network');
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId }]
            });
        } catch (error) {
            // This error code indicates that the chain has not been added to MetaMask
            if (error.code === 4902) {
                throw new Error('Please add this network to MetaMask');
            }
            throw error;
        }
    }

    /**
     * Get current connection info
     */
    getConnectionInfo() {
        return {
            isConnected: this.connectionState === 'CONNECTED',
            account: this.currentAccount,
            chainId: this.currentChainId,
            network: this.currentChainId ? this.SUPPORTED_CHAINS[this.currentChainId] : null
        };
    }

    /**
     * Cleanup service
     */
    cleanup() {
        // Remove event listeners
        this.removeAllListeners();
        
        // Clear intervals
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
        
        // Abort any pending operations
        this.abortController.abort();
    }
}

// Create singleton instance
const walletService = new WalletService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = walletService;
} else {
    window.walletService = walletService;
} 