/**
 * Authentication Page Controller
 * Uses centralized WalletService for all MetaMask interactions
 * Focuses on auth page UI state management
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeAuthPage();
});

/**
 * Initialize authentication page
 */
async function initializeAuthPage() {
    // Wait for wallet service to be ready
    if (window.walletService) {
        await window.walletService.ensureReady();
}

    // Check MetaMask availability
    if (!window.walletService.isMetaMaskAvailable()) {
        showInstallMetaMaskOption();
    }
    
    // Check existing connection
    checkExistingConnection();
    
    // Setup auth page event listeners
    setupAuthPageListeners();
}

/**
 * Show install MetaMask option
 */
function showInstallMetaMaskOption() {
    const installSection = document.getElementById('install-metamask');
    if (installSection) {
        installSection.style.display = 'block';
    }
    
    // Hide connect button
    const connectButton = document.getElementById('connect-metamask');
    if (connectButton) {
        connectButton.style.display = 'none';
}
}

/**
 * Check if wallet is already connected
 */
function checkExistingConnection() {
    const connectionInfo = window.walletService.getConnectionInfo();
    
    if (connectionInfo.isConnected) {
        // Already connected, show success and redirect
        showConnectionSuccess('Already connected! Redirecting...');
                setTimeout(() => {
            window.authManager.redirectToIntendedDestination();
        }, 1500);
            }
}

/**
 * Setup auth page specific event listeners
 */
function setupAuthPageListeners() {
    // Connect button click handler
    const connectButton = document.getElementById('connect-metamask');
    if (connectButton) {
        connectButton.addEventListener('click', handleConnectClick);
    }
    
    // Listen for wallet connection events
    window.addEventListener('walletConnected', handleWalletConnected);
    window.addEventListener('walletDisconnected', handleWalletDisconnected);
    window.addEventListener('unsupportedNetwork', handleUnsupportedNetwork);
}

/**
 * Handle connect button click
 */
async function handleConnectClick(event) {
    event.preventDefault();
    
    const button = event.target.closest('#connect-metamask');
    const originalContent = button.innerHTML;
    
    try {
        // Update button state
        showConnectionStatus('Connecting to MetaMask...', 'Please check your MetaMask extension and approve the connection request.');
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            
        // Connect via WalletService
        const result = await window.walletService.connect();
        
        // Check if we need to switch to Injective testnet
        const targetChainId = '0x59f'; // Injective testnet
        if (result.chainId !== targetChainId) {
            showConnectionStatus('Switching to Injective Testnet...', 'Please approve the network switch in MetaMask.');
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Switching Network...';
            
            try {
                await window.walletService.switchNetwork(targetChainId);
                console.log('Successfully switched to Injective testnet');
            } catch (switchError) {
                console.warn('Failed to switch network:', switchError);
                showConnectionError('Network Switch Required', 'Please manually switch to Injective testnet in MetaMask.');
            }
        }
            
        // Success is handled by walletConnected event
    } catch (error) {
        console.error('Connection error:', error);
        
        // Reset button
        button.disabled = false;
        button.innerHTML = originalContent;
        
        // Show appropriate error
        handleConnectionError(error);
    }
}

/**
 * Handle successful wallet connection
 */
function handleWalletConnected(event) {
    const { account, chainId } = event.detail;
    const network = window.walletService.SUPPORTED_CHAINS[chainId];
    
    showConnectionSuccess(
        'Connected successfully!', 
        `Connected to ${getShortAddress(account)} on ${network ? network.name : 'Unknown Network'}`
    );
}

/**
 * Handle wallet disconnection
 */
function handleWalletDisconnected() {
    hideConnectionStatus();
    
    // Reset connect button
    const connectButton = document.getElementById('connect-metamask');
    if (connectButton) {
        connectButton.disabled = false;
        connectButton.innerHTML = '<i class="fab fa-ethereum"></i> Connect MetaMask';
        connectButton.classList.remove('btn-success');
        connectButton.classList.add('btn-primary');
    }
}

/**
 * Handle unsupported network
 */
function handleUnsupportedNetwork(event) {
    const { chainId } = event.detail;
    showConnectionError(
        'Unsupported Network',
                                'Please switch to Ethereum Mainnet, Polygon, Sepolia testnet, or Injective in MetaMask.'
    );
}

/**
 * Handle connection errors with enhanced messaging
 */
function handleConnectionError(error) {
    let title = 'Connection Failed';
    let message = error.message || 'Failed to connect to MetaMask';
    let showRetry = true;
    
    // Customize message based on error type
    switch (error.type) {
        case 'NOT_INSTALLED':
            showInstallMetaMaskOption();
            hideConnectionStatus();
            return;
            
        case 'USER_REJECTED':
            title = 'Connection Rejected';
            message = 'You rejected the connection request. Click "Connect MetaMask" to try again.';
            break;
            
        case 'REQUEST_PENDING':
            title = 'Request Pending';
            message = 'A connection request is already pending. Please check your MetaMask extension.';
            break;
            
        case 'WRONG_NETWORK':
            title = 'Wrong Network';
                                message = 'Please switch to a supported network (Ethereum, Polygon, Sepolia, or Injective).';
            break;
            
        case 'TIMEOUT':
            title = 'Connection Timeout';
            message = 'The connection request timed out. Please try again.';
            break;
            
        case 'NO_ACCOUNTS':
            title = 'No Accounts Found';
            message = 'Please create or unlock your MetaMask wallet.';
            break;
    }
    
    showConnectionError(title, message);
    
    // Auto-hide after delay if recoverable
    if (error.recoverable !== false) {
    setTimeout(() => {
        hideConnectionStatus();
    }, 5000);
    }
}

/**
 * Show connection status (connecting)
 */
function showConnectionStatus(title, message) {
    const statusCard = document.getElementById('connection-status');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const statusIcon = document.getElementById('status-icon');
    
    if (statusCard && statusTitle && statusMessage && statusIcon) {
        statusTitle.textContent = title;
        statusMessage.textContent = message;
        statusIcon.className = 'fas fa-spinner fa-spin';
        statusIcon.style.color = '#25f2f2';
        statusCard.style.display = 'block';
    }
}

/**
 * Show connection success
 */
function showConnectionSuccess(title, message = '') {
    const statusCard = document.getElementById('connection-status');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const statusIcon = document.getElementById('status-icon');
    
    if (statusCard && statusTitle && statusMessage && statusIcon) {
        statusTitle.textContent = title;
        statusMessage.textContent = message || 'Redirecting to your destination...';
        statusIcon.className = 'fas fa-check-circle';
        statusIcon.style.color = '#10b981';
        statusCard.style.display = 'block';
        
        // Update button
        const connectButton = document.getElementById('connect-metamask');
        if (connectButton) {
            connectButton.disabled = true;
            connectButton.innerHTML = '<i class="fas fa-check"></i> Connected!';
            connectButton.classList.remove('btn-primary');
            connectButton.classList.add('btn-success');
        }
    }
}

/**
 * Show connection error
 */
function showConnectionError(title, message) {
    const statusCard = document.getElementById('connection-status');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const statusIcon = document.getElementById('status-icon');
    
    if (statusCard && statusTitle && statusMessage && statusIcon) {
        statusTitle.textContent = title;
        statusMessage.textContent = message;
        statusIcon.className = 'fas fa-exclamation-triangle';
        statusIcon.style.color = '#ef4444';
        statusCard.style.display = 'block';
    }
}

/**
 * Hide connection status
 */
function hideConnectionStatus() {
    const statusCard = document.getElementById('connection-status');
    if (statusCard) {
        statusCard.style.display = 'none';
    }
}

/**
 * Utility function to get short address format
 */
function getShortAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}