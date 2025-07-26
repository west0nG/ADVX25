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
        
        // State validation control
        this.isValidating = false;
        this.lastValidationTime = 0;
        this.validationCooldown = 5000; // 5 seconds between validations
        
        // Configuration
        this.SUPPORTED_CHAINS = {
            '0x1': { name: 'Ethereum Mainnet', id: 1 },
            '0x89': { name: 'Polygon', id: 137 },
            '0xaa36a7': { name: 'Sepolia Testnet', id: 11155111 },
            '0x5': { name: 'Goerli Testnet', id: 5 },
            '0x9dd': { name: 'inEVM Mainnet', id: 2525, rpcUrl: 'https://mainnet.rpc.inevm.com/http', blockExplorer: 'https://explorer.inevm.com', currency: 'INJ' },
            '0x978': { name: 'inEVM Testnet', id: 2424, rpcUrl: 'https://testnet.rpc.inevm.com/http', blockExplorer: 'https://testnet.explorer.inevm.com', currency: 'INJ' },
            '0x59f': { name: 'Injective Testnet', id: 1439, rpcUrl: 'https://clean-cool-dust.injective-testnet.quiknode.pro/f2dcf86a3537602a3470aa71713305c63797504d', blockExplorer: 'https://testnet.explorer.injective.network', currency: 'INJ' }
        };
        
        // Storage keys - using consistent localStorage for persistence
        this.STORAGE_KEYS = {
            CONNECTED: 'wallet_connected',
            ADDRESS: 'wallet_address',
            CHAIN_ID: 'wallet_chain_id',
            TYPE: 'wallet_type',
            CONNECTION_TIME: 'wallet_connection_time',
            SESSION_ID: 'wallet_session_id'
        };
        
        // Generate session ID for this browser session
        this.sessionId = this.generateSessionId();
        
        // Initialize service (async)
        this.initializeAsync();
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
        console.log('WalletService: Initializing...');
        
        if (!this.isMetaMaskAvailable()) {
            console.log('MetaMask not available');
            return;
        }

        // Setup cleanup on page unload
        window.addEventListener('beforeunload', () => this.cleanup(), { signal: this.abortController.signal });
        
        // Validate stored state with improved logic
        await this.validateStoredState();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start periodic state validation with better timing
        this.startStateValidation();
        
        console.log('WalletService: Initialization complete', {
            state: this.connectionState,
            account: this.currentAccount,
            chainId: this.currentChainId
        });
    }

    /**
     * Check if MetaMask is available
     */
    isMetaMaskAvailable() {
        return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
    }

    /**
     * Validate stored authentication state with improved logic
     */
    async validateStoredState() {
        // Prevent concurrent validations
        if (this.isValidating) {
            console.log('WalletService: Validation already in progress');
            return;
        }
        
        // Rate limiting
        const now = Date.now();
        if (now - this.lastValidationTime < this.validationCooldown) {
            console.log('WalletService: Validation rate limited');
            return;
        }
        
        this.isValidating = true;
        this.lastValidationTime = now;
        
        try {
            const storedAddress = localStorage.getItem(this.STORAGE_KEYS.ADDRESS);
            const storedChainId = localStorage.getItem(this.STORAGE_KEYS.CHAIN_ID);
            const storedConnected = localStorage.getItem(this.STORAGE_KEYS.CONNECTED);
            
            if (!storedAddress || storedConnected !== 'true') {
                console.log('WalletService: No stored connection found');
                this.clearStoredState();
                return;
            }

            // Check MetaMask connection status
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            const currentAddress = accounts[0]?.toLowerCase();
            const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });

            if (!currentAddress) {
                console.log('WalletService: No MetaMask accounts found');
                this.clearStoredState();
                return;
            }

            if (currentAddress !== storedAddress.toLowerCase()) {
                console.log('WalletService: Address mismatch detected', {
                    stored: storedAddress,
                    current: currentAddress
                });
                // Update to new address instead of clearing
                this.handleAccountChange(currentAddress);
                return;
            }

            // Valid state - restore connection
            this.currentAccount = currentAddress;
            this.currentChainId = currentChainId;
            this.connectionState = 'CONNECTED';
            
            // Update chain ID if changed
            if (currentChainId !== storedChainId) {
                console.log('WalletService: Chain ID updated', {
                    stored: storedChainId,
                    current: currentChainId
                });
                this.updateStoredState(currentAddress, currentChainId);
            }
            
            console.log('WalletService: State validation successful', {
                account: this.currentAccount,
                chainId: this.currentChainId
            });
            
        } catch (error) {
            console.error('WalletService: Error validating stored state:', error);
            // Don't clear state for network errors
            if (error.code !== -32603) {
                this.clearStoredState();
            }
        } finally {
            this.isValidating = false;
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
            this.updateStoredState(account, chainId);

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
                message: 'Please switch to a supported network (Ethereum, Polygon, Sepolia, or Injective)',
                recoverable: true,
                action: () => this.showNetworkSelector()
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
     * Handle account change with improved logic
     */
    handleAccountChange(newAccount) {
        console.log('WalletService: Account changed', {
            old: this.currentAccount,
            new: newAccount
        });
        
        this.currentAccount = newAccount;
        this.updateStoredState(newAccount, this.currentChainId);

        // Notify UI
        window.dispatchEvent(new CustomEvent('accountChanged', {
            detail: { account: newAccount }
        }));
    }

    /**
     * Handle chain change with improved logging
     */
    handleChainChange(chainId) {
        console.log('WalletService: Chain changed', {
            old: this.currentChainId,
            new: chainId
        });
        
        this.currentChainId = chainId;
        this.updateStoredState(this.currentAccount, chainId);

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
        console.log('WalletService: Wallet disconnected');
        this.disconnect();
    }

    /**
     * Update stored authentication state with consistent storage
     */
    updateStoredState(account, chainId = null) {
        const now = new Date().toISOString();
        const currentChainId = chainId || this.currentChainId;
        
        // Use consistent localStorage for all auth state
        localStorage.setItem(this.STORAGE_KEYS.CONNECTED, 'true');
        localStorage.setItem(this.STORAGE_KEYS.ADDRESS, account);
        localStorage.setItem(this.STORAGE_KEYS.CHAIN_ID, currentChainId);
        localStorage.setItem(this.STORAGE_KEYS.TYPE, 'metamask');
        localStorage.setItem(this.STORAGE_KEYS.CONNECTION_TIME, now);
        localStorage.setItem(this.STORAGE_KEYS.SESSION_ID, this.sessionId);
        
        // Clear any old inconsistent storage
        sessionStorage.removeItem('intendedDestination'); // This should be separate
        
        console.log('WalletService: State updated', {
            account,
            chainId: currentChainId,
            time: now
        });
    }

    /**
     * Check if session has expired
     */
    isSessionExpired() {
        const connectionTime = localStorage.getItem(this.STORAGE_KEYS.CONNECTION_TIME);
        if (!connectionTime) return true;
        
        const sessionTimeout = window.APP_CONFIG?.auth?.sessionTimeout || 86400000; // 24 hours default
        const elapsed = Date.now() - new Date(connectionTime).getTime();
        
        return elapsed > sessionTimeout;
    }

    /**
     * Get debug information
     */
    getDebugInfo() {
        return {
            connectionState: this.connectionState,
            currentAccount: this.currentAccount,
            currentChainId: this.currentChainId,
            sessionId: this.sessionId,
            isValidating: this.isValidating,
            lastValidationTime: this.lastValidationTime,
            storedState: {
                connected: localStorage.getItem(this.STORAGE_KEYS.CONNECTED),
                address: localStorage.getItem(this.STORAGE_KEYS.ADDRESS),
                chainId: localStorage.getItem(this.STORAGE_KEYS.CHAIN_ID),
                connectionTime: localStorage.getItem(this.STORAGE_KEYS.CONNECTION_TIME),
                sessionId: localStorage.getItem(this.STORAGE_KEYS.SESSION_ID)
            },
            sessionExpired: this.isSessionExpired(),
            metamaskAvailable: this.isMetaMaskAvailable()
        };
    }

    /**
     * Clear stored authentication state completely
     */
    clearStoredState() {
        console.log('WalletService: Clearing stored state');
        
        // Clear all wallet-related localStorage
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        
        // Clear legacy storage keys for compatibility
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        localStorage.removeItem('walletType');
        localStorage.removeItem('connectionTime');
        localStorage.removeItem('hasIDNFT');
        
        // Reset internal state
        this.currentAccount = null;
        this.currentChainId = null;
        this.connectionState = 'IDLE';
    }

    /**
     * Start periodic state validation with improved timing
     */
    startStateValidation() {
        // Clear any existing interval
        if (this.validationInterval) {
            clearInterval(this.validationInterval);
        }
        
        // Validate state every 60 seconds (increased from 30 to reduce interruptions)
        this.validationInterval = setInterval(() => {
            if (this.connectionState === 'CONNECTED' && !this.isValidating) {
                this.validateStoredState();
            }
        }, 60000);
        
        console.log('WalletService: State validation started (60s interval)');
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
                const network = this.SUPPORTED_CHAINS[chainId];
                try {
                    // Add the network to MetaMask first
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [{
                            chainId: chainId,
                            chainName: network.name,
                            rpcUrls: [network.rpcUrl],
                            nativeCurrency: {
                                name: network.currency || 'ETH',
                                symbol: network.currency || 'ETH',
                                decimals: 18
                            },
                            blockExplorerUrls: network.blockExplorer ? [network.blockExplorer] : null
                        }]
                    });
                } catch (addError) {
                    throw new Error(`Failed to add network to MetaMask: ${addError.message}`);
                }
            } else {
                throw error;
            }
        }
    }

    /**
     * Show network selection modal
     */
    showNetworkSelector() {
        // Remove any existing modal
        const existingModal = document.getElementById('network-selector-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'network-selector-modal';
        modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: rgba(31, 41, 55, 0.95); padding: 2rem; border-radius: 20px; border: 1px solid rgba(55, 65, 81, 0.3); max-width: 400px; width: 90%;">
                    <h2 style="color: #25f2f2; margin-bottom: 1rem; text-align: center;">Select Network</h2>
                    <p style="color: #9ca3af; margin-bottom: 1.5rem; text-align: center;">Choose a supported network to continue:</p>
                    <div id="network-options" style="display: flex; flex-direction: column; gap: 0.75rem;">
                        ${Object.entries(this.SUPPORTED_CHAINS).map(([chainId, network]) => `
                            <button onclick="window.walletService.selectNetwork('${chainId}')" 
                                    style="background: rgba(37, 242, 242, 0.1); color: #25f2f2; border: 1px solid rgba(37, 242, 242, 0.3); padding: 0.75rem 1rem; border-radius: 10px; cursor: pointer; transition: all 0.3s;">
                                ${network.name}
                            </button>
                        `).join('')}
                    </div>
                    <button onclick="document.getElementById('network-selector-modal').remove()" 
                            style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.5rem 1rem; border-radius: 10px; cursor: pointer; margin-top: 1rem; width: 100%;">
                        Cancel
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    /**
     * Select a network and switch to it
     */
    async selectNetwork(chainId) {
        try {
            document.getElementById('network-selector-modal')?.remove();
            await this.switchNetwork(chainId);
        } catch (error) {
            console.error('Failed to switch network:', error);
            alert(`Failed to switch network: ${error.message}`);
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