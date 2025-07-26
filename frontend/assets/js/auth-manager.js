/**
 * AuthManager - Route protection and authentication flow management
 * Coordinates with WalletService to manage authentication state and protect routes
 */
class AuthManager {
    constructor() {
        // Protected routes that require authentication
        this.protectedRoutes = [
            'main.html',
            'create.html', 
            'profile.html',
            'marketplace.html'
        ];
        
        // Auth page
        this.authPage = 'auth.html';
        
        // Initialize on DOM load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize auth manager
     */
    async initialize() {
        // Wait for the wallet service to finish its async initialization
        if (window.walletService) {
            await window.walletService.ensureReady();
        }

        // Check if current page requires authentication
        this.checkRouteProtection();
        
        // Setup global UI listeners
        this.setupGlobalUIListeners();
        
        // Setup wallet event listeners
        this.setupWalletEventListeners();
    }

    /**
     * Check if current route requires authentication
     */
    checkRouteProtection() {
        const currentPage = this.getCurrentPage();
        
        // Skip if not a protected route
        if (!this.isProtectedRoute(currentPage)) {
            return;
        }

        // Wait for wallet service to be ready
        this.checkAuthenticationWhenReady();
    }

    /**
     * Check authentication when wallet service is ready
     */
    async checkAuthenticationWhenReady() {
        try {
            // Ensure wallet service is initialized
            if (window.walletService) {
                await window.walletService.ensureReady();
            }
            
            // Check authentication state
            const connectionInfo = window.walletService?.getConnectionInfo() || { isConnected: false };
            
            console.log('AuthManager: Checking authentication', {
                page: this.getCurrentPage(),
                isConnected: connectionInfo.isConnected,
                account: connectionInfo.account
            });
            
            if (!connectionInfo.isConnected) {
                // Store intended destination using sessionStorage (appropriate for navigation)
                sessionStorage.setItem('intendedDestination', window.location.href);
                
                console.log('AuthManager: Not authenticated, redirecting to auth page');
                // Redirect to auth page
                this.redirectToAuth();
            } else {
                console.log('AuthManager: Authentication check passed');
            }
        } catch (error) {
            console.error('AuthManager: Error checking authentication:', error);
            // On error, redirect to auth page to be safe
            this.redirectToAuth();
        }
    }

    /**
     * Get current page name from URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.substring(path.lastIndexOf('/') + 1);
        return page || 'index.html';
    }

    /**
     * Check if route is protected
     */
    isProtectedRoute(page) {
        return this.protectedRoutes.includes(page);
    }

    /**
     * Redirect to authentication page
     */
    redirectToAuth() {
        const authPath = window.location.pathname.includes('/pages/') 
            ? 'auth.html' 
            : 'pages/auth.html';
        window.location.href = authPath;
    }

    /**
     * Check ID NFT ownership and redirect accordingly
     */
    async checkIDNFTAndRedirect(account) {
        try {
            // Initialize IDNFT service if not already done
            if (!window.idnftService || !window.idnftService.isInitialized) {
                try {
                    await window.idnftService.initialize();
                } catch (error) {
                    console.error('AuthManager: Failed to initialize ID NFT service:', error);
                    // Proceed with normal redirect if IDNFT service fails
                    this.redirectToIntendedDestination();
                    return;
                }
            }

            // Check if user has an active ID NFT
            const idnftStatus = await window.idnftService.checkUserIDNFT(account);
            
            if (!idnftStatus.hasActive) {
                // User doesn't have an active ID NFT - show modal for creation
                console.log('AuthManager: User lacks ID NFT, showing creation modal');
                
                // Try to show IDNFT modal
                try {
                    if (window.idnftModal) {
                        await window.idnftModal.openModal();
                    } else {
                        // Modal not available, show creation button
                        this.showIDNFTCreationButton();
                    }
                } catch (error) {
                    console.error('Failed to open IDNFT modal:', error);
                    this.showIDNFTCreationButton();
                }
            } else {
                // User has ID NFT, proceed with normal redirect
                console.log('AuthManager: User has ID NFT, proceeding with redirect');
                this.redirectToIntendedDestination();
            }
        } catch (error) {
            console.error('AuthManager: Error checking ID NFT status:', error);
            // On error, proceed with normal redirect
            this.redirectToIntendedDestination();
        }
    }

    /**
     * Redirect to intended destination after login
     */
    redirectToIntendedDestination() {
        const intendedDestination = sessionStorage.getItem('intendedDestination');
        sessionStorage.removeItem('intendedDestination');
        
        console.log('AuthManager: Redirecting after login', {
            intended: intendedDestination,
            current: window.location.href
        });
        
        if (intendedDestination && intendedDestination !== window.location.href) {
            window.location.href = intendedDestination;
        } else {
            // Default to profile page
            const profilePath = window.location.pathname.includes('/pages/')
                ? 'profile.html'
                : 'pages/profile.html';
            window.location.href = profilePath;
        }
    }

    /**
     * Setup wallet event listeners
     */
    setupWalletEventListeners() {
        // Wallet connected
        window.addEventListener('walletConnected', async (event) => {
            const { account, chainId } = event.detail;
            console.log('AuthManager: Wallet connected event received', { account, chainId });
            
            // Update global UI
            this.updateGlobalUI({
                isConnected: true,
                account,
                chainId,
                network: window.walletService.SUPPORTED_CHAINS[chainId]
            });
            
            // If on auth page, check ID NFT ownership before redirecting
            if (this.getCurrentPage() === this.authPage) {
                console.log('AuthManager: On auth page, checking ID NFT ownership before redirect');
                setTimeout(async () => {
                    await this.checkIDNFTAndRedirect(account);
                }, 1500);
            }
        });

        // Wallet disconnected
        window.addEventListener('walletDisconnected', () => {
            console.log('AuthManager: Wallet disconnected event received');
            
            // Update global UI
            this.updateGlobalUI({
                isConnected: false,
                account: null,
                chainId: null,
                network: null
            });
            
            // If on protected route, redirect to auth
            if (this.isProtectedRoute(this.getCurrentPage())) {
                console.log('AuthManager: On protected route, redirecting to auth page');
                this.redirectToAuth();
            }
        });

        // Account changed
        window.addEventListener('accountChanged', (event) => {
            const { account } = event.detail;
            console.log('AuthManager: Account changed event received', { account });
            
            // Update global UI
            this.updateGlobalUI({
                isConnected: true,
                account,
                chainId: window.walletService.currentChainId,
                network: window.walletService.SUPPORTED_CHAINS[window.walletService.currentChainId]
            });
        });

        // Chain changed
        window.addEventListener('chainChanged', (event) => {
            const { chainId, network } = event.detail;
            console.log('AuthManager: Chain changed event received', { chainId, network });
            
            // Update global UI
            this.updateGlobalUI({
                isConnected: true,
                account: window.walletService.currentAccount,
                chainId,
                network
            });
        });

        // Unsupported network
        window.addEventListener('unsupportedNetwork', (event) => {
            const { chainId } = event.detail;
            console.warn('AuthManager: Unsupported network event received', { chainId });
            
            // Show network warning
            this.showNetworkWarning(chainId);
        });
    }

    /**
     * Setup global UI listeners
     */
    setupGlobalUIListeners() {
        // Connect wallet buttons
        document.addEventListener('click', async (event) => {
            const connectButton = event.target.closest('[data-wallet-connect]');
            if (connectButton) {
                event.preventDefault();
                await this.handleConnectWallet(connectButton);
            }
            
            // Disconnect wallet buttons
            const disconnectButton = event.target.closest('[data-wallet-disconnect]');
            if (disconnectButton) {
                event.preventDefault();
                this.handleDisconnectWallet();
            }
            
            // Network switch buttons
            const networkButton = event.target.closest('[data-switch-network]');
            if (networkButton) {
                event.preventDefault();
                const chainId = networkButton.getAttribute('data-switch-network');
                await this.handleNetworkSwitch(chainId);
            }
        });
    }

    /**
     * Handle connect wallet button clicks
     */
    async handleConnectWallet(button) {
        const originalContent = button.innerHTML;
        
        try {
            // Update button state
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            
            // Ensure wallet service is ready and connect
            await window.walletService.ensureReady();
            const connectionResult = await window.walletService.connect();
            
            // Check if we need to switch to Injective testnet
            const targetChainId = '0x59f'; // Injective testnet
            if (connectionResult.chainId !== targetChainId) {
                console.log('AuthManager: Switching to Injective testnet...');
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Switching to Injective...';
                
                try {
                    await window.walletService.switchNetwork(targetChainId);
                    console.log('AuthManager: Successfully switched to Injective testnet');
                } catch (switchError) {
                    console.warn('AuthManager: Failed to switch network:', switchError);
                    // Continue anyway - user might switch manually
                    this.showNetworkWarning('Please switch to Injective testnet in MetaMask');
                }
            }
            
            // Success - button will be updated by global UI update
        } catch (error) {
            console.error('Connection error:', error);
            
            // Reset button
            button.disabled = false;
            button.innerHTML = originalContent;
            
            // Show error
            this.showConnectionError(error);
        }
    }

    /**
     * Handle disconnect wallet
     */
    handleDisconnectWallet() {
        window.walletService.disconnect();
    }

    /**
     * Handle network switch
     */
    async handleNetworkSwitch(chainId) {
        try {
            await window.walletService.switchNetwork(chainId);
        } catch (error) {
            console.error('Network switch error:', error);
            this.showNetworkError(error);
        }
    }

    /**
     * Update global UI based on wallet state
     */
    updateGlobalUI(state) {
        // Update all connect buttons
        const connectButtons = document.querySelectorAll('[data-wallet-connect]');
        connectButtons.forEach(button => {
            if (state.isConnected) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-check"></i> Connected';
                button.classList.remove('btn-primary');
                button.classList.add('btn-success');
            } else {
                button.disabled = false;
                button.innerHTML = '<i class="fab fa-ethereum"></i> Connect Wallet';
                button.classList.remove('btn-success');
                button.classList.add('btn-primary');
            }
        });
        
        // Update wallet address displays
        const addressDisplays = document.querySelectorAll('[data-wallet-address]');
        addressDisplays.forEach(display => {
            if (state.isConnected && state.account) {
                display.textContent = this.getShortAddress(state.account);
                display.style.display = 'inline';
            } else {
                display.style.display = 'none';
            }
        });
        
        // Update network displays
        const networkDisplays = document.querySelectorAll('[data-wallet-network]');
        networkDisplays.forEach(display => {
            if (state.isConnected && state.network) {
                display.textContent = state.network.name;
                display.style.display = 'inline';
            } else {
                display.style.display = 'none';
            }
        });
        
        // Show/hide wallet-dependent features
        const walletFeatures = document.querySelectorAll('[data-wallet-required]');
        walletFeatures.forEach(feature => {
            if (state.isConnected) {
                feature.style.display = '';
                feature.classList.remove('d-none');
            } else {
                feature.style.display = 'none';
                feature.classList.add('d-none');
            }
        });
        
        // Update disconnect buttons
        const disconnectButtons = document.querySelectorAll('[data-wallet-disconnect]');
        disconnectButtons.forEach(button => {
            if (state.isConnected) {
                button.style.display = '';
            } else {
                button.style.display = 'none';
            }
        });
        
        // Fire custom event for page-specific updates
        window.dispatchEvent(new CustomEvent('globalUIUpdate', { detail: state }));
    }

    /**
     * Show connection error
     */
    showConnectionError(error) {
        let title = 'Connection Failed';
        let message = error.message || 'Failed to connect to MetaMask';
        let showRetry = error.recoverable !== false;
        
        // Create or update error display
        let errorDisplay = document.getElementById('wallet-error-display');
        if (!errorDisplay) {
            errorDisplay = document.createElement('div');
            errorDisplay.id = 'wallet-error-display';
            errorDisplay.className = 'wallet-error-toast';
            document.body.appendChild(errorDisplay);
        }
        
        errorDisplay.innerHTML = `
            <div class="wallet-error-content">
                <div class="wallet-error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <div class="wallet-error-text">
                    <div class="wallet-error-title">${title}</div>
                    <div class="wallet-error-message">${message}</div>
                </div>
                ${showRetry ? '<button class="wallet-error-retry" onclick="window.authManager.retryConnection()">Try Again</button>' : ''}
                <button class="wallet-error-close" onclick="window.authManager.hideError()">×</button>
            </div>
        `;
        
        errorDisplay.classList.add('show');
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            this.hideError();
        }, 10000);
    }

    /**
     * Show IDNFT creation button when modal fails
     */
    showIDNFTCreationButton() {
        // Remove any existing IDNFT prompt
        const existingPrompt = document.getElementById('idnft-creation-prompt');
        if (existingPrompt) {
            existingPrompt.remove();
        }
        
        // Create IDNFT creation prompt
        const promptContainer = document.createElement('div');
        promptContainer.id = 'idnft-creation-prompt';
        promptContainer.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
                <div style="background: rgba(31, 41, 55, 0.95); padding: 2rem; border-radius: 20px; border: 1px solid rgba(55, 65, 81, 0.3); max-width: 400px; width: 90%; text-align: center;">
                    <h3 style="color: #25f2f2; margin-bottom: 1rem;">
                        <i class="fas fa-id-card"></i> ID NFT Required
                    </h3>
                    <p style="color: #9ca3af; margin-bottom: 1.5rem;">
                        You need to create a Bar Identity NFT to access all platform features. This is a one-time setup.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer;">
                            Skip for Now
                        </button>
                        <button onclick="window.authManager.createIDNFTManually()" 
                                style="background: rgba(37, 242, 242, 0.1); color: #25f2f2; border: 1px solid rgba(37, 242, 242, 0.3); padding: 0.75rem 1rem; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-magic"></i> Create ID NFT
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(promptContainer);
    }

    /**
     * Manual IDNFT creation when modal fails
     */
    async createIDNFTManually() {
        try {
            // Remove the prompt
            const prompt = document.getElementById('idnft-creation-prompt');
            if (prompt) {
                prompt.remove();
            }
            
            // Try to initialize IDNFT modal if not already done
            if (!window.idnftModal) {
                // Import and initialize the modal
                const script = document.createElement('script');
                script.src = window.location.pathname.includes('/pages/') 
                    ? '../assets/js/idnft-modal.js' 
                    : 'assets/js/idnft-modal.js';
                document.head.appendChild(script);
                
                // Wait for script to load
                await new Promise((resolve, reject) => {
                    script.onload = resolve;
                    script.onerror = reject;
                });
                
                // Wait a bit more for initialization
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
            // Try to open modal again
            if (window.idnftModal) {
                await window.idnftModal.openModal();
            } else {
                                    // Final fallback - redirect to IDNFT creation page
                    const createIDNFTPath = window.location.pathname.includes('/pages/')
                        ? 'create-idnft.html'
                        : 'pages/create-idnft.html';
                    window.location.href = createIDNFTPath;
            }
        } catch (error) {
            console.error('Manual IDNFT creation failed:', error);
            alert('Failed to open IDNFT creation form. Please try refreshing the page.');
        }
    }

    /**
     * Show network warning
     */
    showNetworkWarning(messageOrChainId) {
        // Handle both string messages and chainId
        const message = typeof messageOrChainId === 'string' 
            ? messageOrChainId 
            : 'Please switch to a supported network (Ethereum, Polygon, Sepolia, or Injective)';
        
        let warningDisplay = document.getElementById('network-warning-display');
        if (!warningDisplay) {
            warningDisplay = document.createElement('div');
            warningDisplay.id = 'network-warning-display';
            warningDisplay.className = 'network-warning-banner';
            
            // Insert at top of body
            document.body.insertBefore(warningDisplay, document.body.firstChild);
        }
        
        warningDisplay.innerHTML = `
            <div class="network-warning-content">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <div class="network-warning-actions">
                    <button class="btn btn-sm btn-light" data-switch-network="0x1">Ethereum</button>
                    <button class="btn btn-sm btn-light" data-switch-network="0x89">Polygon</button>
                    <button class="btn btn-sm btn-light" data-switch-network="0xaa36a7">Sepolia</button>
                </div>
            </div>
        `;
        
        warningDisplay.style.display = 'block';
    }

    /**
     * Hide error display
     */
    hideError() {
        const errorDisplay = document.getElementById('wallet-error-display');
        if (errorDisplay) {
            errorDisplay.classList.remove('show');
        }
    }

    /**
     * Retry connection
     */
    async retryConnection() {
        this.hideError();
        const connectButton = document.querySelector('[data-wallet-connect]');
        if (connectButton) {
            await this.handleConnectWallet(connectButton);
        }
    }

    /**
     * Get shortened address format
     */
    getShortAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
}

// Create singleton instance
const authManager = new AuthManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = authManager;
} else {
    window.authManager = authManager;
} 