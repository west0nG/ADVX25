// Main Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Dashboard initialization
function initializeDashboard() {
    checkWalletConnection();
    loadUserData();
    setupEventListeners();
}

// Check if wallet is connected
function checkWalletConnection() {
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' })
        .then(accounts => {
            if (accounts.length > 0) {
                updateWalletDisplay(accounts[0]);
            } else {
                redirectToAuth();
            }
        })
        .catch(error => {
            console.error('Error checking wallet connection:', error);
            redirectToAuth();
        });
    } else {
        redirectToAuth();
    }
}

// Update wallet display
function updateWalletDisplay(address) {
    const walletAddressElement = document.getElementById('wallet-address');
    if (walletAddressElement) {
        const shortAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        walletAddressElement.textContent = shortAddress;
    }
}

// Redirect to authentication page
function redirectToAuth() {
    window.location.href = 'auth.html';
}

// Disconnect wallet
function disconnectWallet() {
    if (confirm('Are you sure you want to disconnect your wallet?')) {
        // Clear any stored wallet data
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
        
        // Redirect to home page
        window.location.href = '../index.html';
    }
}

// Load user data
function loadUserData() {
    // This would typically fetch data from your backend/blockchain
    // For now, we'll use mock data
    updateStats();
    loadRecentActivity();
    loadNFTCollection();
}

// Update dashboard stats
function updateStats() {
    // Mock data - in a real app, this would come from blockchain/API
    const stats = {
        nftsOwned: 12,
        ethBalance: 3.45,
        totalSales: 8
    };

    // Update stat cards
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 3) {
        statCards[0].querySelector('.stat-number').textContent = stats.nftsOwned;
        statCards[1].querySelector('.stat-number').textContent = stats.ethBalance;
        statCards[2].querySelector('.stat-number').textContent = stats.totalSales;
    }
}

// Load recent activity
function loadRecentActivity() {
    // Activity data would be fetched from your backend
    console.log('Recent activity loaded');
}

// Load NFT collection preview
function loadNFTCollection() {
    // NFT data would be fetched from blockchain/IPFS
    console.log('NFT collection loaded');
}

// Setup event listeners
function setupEventListeners() {
    // No additional event listeners needed for now
    // Dashboard interactions are handled by individual onclick attributes
}

// Dashboard action functions
function createNFT() {
    window.location.href = 'create.html';
}

function manageCollection() {
    alert('Collection management coming soon!');
}

function browseRecipes() {
    window.location.href = 'marketplace.html';
}

function viewOrders() {
    alert('Order management coming soon!');
}

function viewAnalytics() {
    alert('Analytics dashboard coming soon!');
}

function exportData() {
    alert('Data export functionality coming soon!');
}

function exploreNetwork() {
    window.location.href = 'profile.html';
}

function managePartnerships() {
    alert('Partnership management coming soon!');
}

function viewFullCollection() {
    alert('Full collection view coming soon!');
}

// Utility functions for wallet interaction
async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length > 0) {
                updateWalletDisplay(accounts[0]);
                localStorage.setItem('walletConnected', 'true');
                localStorage.setItem('walletAddress', accounts[0]);
                return accounts[0];
            }
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            alert('Failed to connect to MetaMask. Please try again.');
        }
    } else {
        alert('MetaMask is not installed. Please install MetaMask to continue.');
    }
}

async function getBalance() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                const balance = await window.ethereum.request({
                    method: 'eth_getBalance',
                    params: [accounts[0], 'latest']
                });
                return parseInt(balance, 16) / Math.pow(10, 18); // Convert from wei to ETH
            }
        } catch (error) {
            console.error('Error getting balance:', error);
        }
    }
    return 0;
}

// Network change handler
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length === 0) {
            disconnectWallet();
        } else {
            updateWalletDisplay(accounts[0]);
            loadUserData();
        }
    });

    window.ethereum.on('chainChanged', function (chainId) {
        // Reload the page when chain changes
        window.location.reload();
    });
} 