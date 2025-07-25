// Authentication JavaScript for MetaMask connection
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
});

// Initialize authentication page
function initializeAuth() {
    checkMetaMaskAvailability();
    checkExistingConnection();
    setupEventListeners();
}

// Check if MetaMask is available
function checkMetaMaskAvailability() {
    if (!isMetaMaskAvailable()) {
        showInstallMetaMaskOption();
    }
}

// Show install MetaMask option
function showInstallMetaMaskOption() {
    const installSection = document.getElementById('install-metamask');
    if (installSection) {
        installSection.style.display = 'block';
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add any additional event listeners if needed
    console.log('Auth page event listeners set up');
}

// Check if wallet is already connected
function checkExistingConnection() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
            if (accounts.length > 0) {
                // User is already connected, redirect to profile
                showConnectionSuccess('Already connected! Redirecting to profile...');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
            }
        })
        .catch(error => {
            console.error('Error checking existing connection:', error);
        });
    }
}

// MetaMask connection - main function
async function connectMetaMask() {
    console.log('Attempting to connect to MetaMask...');
    
    if (!isMetaMaskAvailable()) {
        showConnectionError('MetaMask not found', 'Please install MetaMask browser extension to continue.');
        showInstallMetaMaskOption();
        return;
    }

    // Show connecting status
    showConnectionStatus('Connecting to MetaMask...', 'Please check your MetaMask extension and approve the connection request.');
    
    try {
        // Request account access
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        if (accounts.length > 0) {
            const walletAddress = accounts[0];
            console.log('Connected to wallet:', walletAddress);
            
            // Store connection info
            localStorage.setItem('walletConnected', 'true');
            localStorage.setItem('walletAddress', walletAddress);
            localStorage.setItem('walletType', 'metamask');
            localStorage.setItem('connectionTime', new Date().toISOString());
            
            // Show success
            showConnectionSuccess('Connected successfully!', `Connected to ${getShortAddress(walletAddress)}`);
            
            // Redirect to profile after delay
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
            
            return walletAddress;
        } else {
            throw new Error('No accounts returned');
        }
    } catch (error) {
        console.error('Error connecting to MetaMask:', error);
        handleConnectionError(error);
    }
}

// Handle connection errors
function handleConnectionError(error) {
    if (error.code === 4001) {
        // User rejected the request
        showConnectionError('Connection rejected', 'You rejected the connection request. Click "Connect MetaMask" to try again.');
    } else if (error.code === -32002) {
        // Request pending
        showConnectionError('Request pending', 'A connection request is already pending. Please check your MetaMask extension.');
    } else if (error.message && error.message.includes('User rejected')) {
        showConnectionError('Connection rejected', 'Connection was rejected. Please try again and approve the request in MetaMask.');
    } else {
        showConnectionError('Connection failed', 'Failed to connect to MetaMask. Please make sure MetaMask is unlocked and try again.');
    }
    
    // Hide status after delay
    setTimeout(() => {
        hideConnectionStatus();
    }, 5000);
}

// Show connection status (connecting)
function showConnectionStatus(title, message) {
    const statusCard = document.getElementById('connection-status');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const statusIcon = document.getElementById('status-icon');
    
    if (statusCard && statusTitle && statusMessage && statusIcon) {
        statusTitle.textContent = title;
        statusMessage.textContent = message;
        statusIcon.className = 'fas fa-spinner fa-spin';
        statusCard.style.display = 'block';
        
        // Hide the connect button temporarily
        const connectButton = document.getElementById('connect-metamask');
        if (connectButton) {
            connectButton.disabled = true;
            connectButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        }
    }
}

// Show connection success
function showConnectionSuccess(title, message = '') {
    const statusCard = document.getElementById('connection-status');
    const statusTitle = document.getElementById('status-title');
    const statusMessage = document.getElementById('status-message');
    const statusIcon = document.getElementById('status-icon');
    
    if (statusCard && statusTitle && statusMessage && statusIcon) {
        statusTitle.textContent = title;
        statusMessage.textContent = message || 'Redirecting to your profile...';
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

// Show connection error
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
        
        // Reset button
        const connectButton = document.getElementById('connect-metamask');
        if (connectButton) {
            connectButton.disabled = false;
            connectButton.innerHTML = '<i class="fab fa-ethereum"></i> Try Again';
        }
    }
}

// Hide connection status
function hideConnectionStatus() {
    const statusCard = document.getElementById('connection-status');
    if (statusCard) {
        statusCard.style.display = 'none';
    }
    
    // Reset button
    const connectButton = document.getElementById('connect-metamask');
    if (connectButton) {
        connectButton.disabled = false;
        connectButton.innerHTML = '<i class="fab fa-ethereum"></i> Connect MetaMask';
        connectButton.classList.remove('btn-success');
        connectButton.classList.add('btn-primary');
    }
}

// Network change handlers
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length === 0) {
            // User disconnected their wallet
            localStorage.removeItem('walletConnected');
            localStorage.removeItem('walletAddress');
            localStorage.removeItem('walletType');
            localStorage.removeItem('connectionTime');
            console.log('Wallet disconnected');
            hideConnectionStatus();
        } else {
            // User switched accounts
            localStorage.setItem('walletAddress', accounts[0]);
            console.log('Account switched to:', accounts[0]);
        }
    });

    window.ethereum.on('chainChanged', function (chainId) {
        console.log('Chain changed to:', chainId);
        checkNetwork(chainId);
    });

    window.ethereum.on('connect', function (connectInfo) {
        console.log('MetaMask connected:', connectInfo);
    });

    window.ethereum.on('disconnect', function (error) {
        console.log('MetaMask disconnected:', error);
        hideConnectionStatus();
    });
}

// Check if connected to supported network
function checkNetwork(chainId) {
    // Ethereum Mainnet: 0x1
    // Polygon: 0x89  
    // Sepolia Testnet: 0xaa36a7
    // Goerli Testnet: 0x5
    
    const supportedChains = ['0x1', '0x89', '0xaa36a7', '0x5'];
    
    if (!supportedChains.includes(chainId)) {
        console.warn('Unsupported network detected:', chainId);
        showConnectionError('Unsupported Network', 'Please switch to Ethereum Mainnet, Polygon, or a supported testnet.');
    }
}

// Utility function to get short address format
function getShortAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Check MetaMask availability
function isMetaMaskAvailable() {
    return typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

// Get current network name
function getNetworkName(chainId) {
    const networks = {
        '0x1': 'Ethereum Mainnet',
        '0x89': 'Polygon',
        '0xaa36a7': 'Sepolia Testnet',
        '0x5': 'Goerli Testnet'
    };
    return networks[chainId] || 'Unknown Network';
}

// Auto-hide error messages after delay
setInterval(() => {
    const statusCard = document.getElementById('connection-status');
    if (statusCard && statusCard.style.display === 'block') {
        const statusIcon = document.getElementById('status-icon');
        if (statusIcon && statusIcon.classList.contains('fa-exclamation-triangle')) {
            // Auto-hide errors after 10 seconds
            const cardAge = Date.now() - (window.lastErrorTime || 0);
            if (cardAge > 10000) {
                hideConnectionStatus();
            }
        }
    }
}, 1000);

// Track error timing
const originalShowConnectionError = showConnectionError;
showConnectionError = function(title, message) {
    window.lastErrorTime = Date.now();
    originalShowConnectionError(title, message);
}; 