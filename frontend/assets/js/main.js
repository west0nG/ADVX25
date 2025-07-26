/**
 * Main Dashboard JavaScript
 * Handles dashboard functionality and wallet integration
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

/**
 * Initialize dashboard
 */
function initializeDashboard() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (header) {
            if (window.scrollY > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    
    // Listen for wallet state changes
    window.addEventListener('globalUIUpdate', handleWalletStateChange);
    
    // Initialize wallet-dependent features
    updateWalletDependentUI();
}

/**
 * Handle wallet state changes
 */
function handleWalletStateChange(event) {
    const { isConnected, account, network } = event.detail;
    
    // Update dashboard based on connection state
    updateWalletDependentUI();
    
    if (isConnected) {
        console.log('Dashboard: Wallet connected', account, network);
        loadUserData(account);
    } else {
        console.log('Dashboard: Wallet disconnected');
        clearUserData();
    }
}

/**
 * Update UI elements that depend on wallet connection
 */
function updateWalletDependentUI() {
    const connectionInfo = window.walletService?.getConnectionInfo() || { isConnected: false };
    
    // Show/hide wallet-dependent sections
    const walletSections = document.querySelectorAll('[data-wallet-required]');
    walletSections.forEach(section => {
        if (connectionInfo.isConnected) {
            section.style.display = '';
            section.classList.remove('d-none');
        } else {
            section.style.display = 'none';
            section.classList.add('d-none');
        }
    });
    
    // Update user info displays
    if (connectionInfo.isConnected && connectionInfo.account) {
        updateUserInfo(connectionInfo.account, connectionInfo.network);
    }
}

/**
 * Load user data from wallet/blockchain
 */
async function loadUserData(account) {
    try {
        // Update user stats
        await updateUserStats(account);
        
        // Load user NFTs
        await loadUserNFTs(account);
        
        // Load recent activity
        await loadRecentActivity(account);
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Error loading user data', 'error');
    }
}

/**
 * Update user stats
 */
async function updateUserStats(account) {
    // Mock data for now - replace with actual blockchain calls
    const stats = {
        created: Math.floor(Math.random() * 50),
        collected: Math.floor(Math.random() * 200),
        earned: (Math.random() * 10).toFixed(2)
    };
    
    // Update stat displays
    const createdEl = document.querySelector('[data-stat="created"]');
    const collectedEl = document.querySelector('[data-stat="collected"]');
    const earnedEl = document.querySelector('[data-stat="earned"]');
    
    if (createdEl) createdEl.textContent = stats.created;
    if (collectedEl) collectedEl.textContent = stats.collected;
    if (earnedEl) earnedEl.textContent = stats.earned + ' ETH';
}

/**
 * Load user NFTs
 */
async function loadUserNFTs(account) {
    // Mock NFT data for now
    const nfts = [
        {
            id: 1,
            name: "Classic Manhattan",
            image: "https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg",
            price: "0.5"
        },
        {
            id: 2,
            name: "Tropical Sunset",
            image: "https://static.paraflowcontent.com/public/resource/image/e54f339e-235e-4246-a4f7-6cb0f21d2ca6.jpeg",
            price: "1.2"
        }
    ];
    
    // Update NFT gallery
    const nftContainer = document.querySelector('.nft-gallery');
    if (nftContainer) {
        nftContainer.innerHTML = nfts.map(nft => `
            <div class="nft-card">
                <img src="${nft.image}" alt="${nft.name}" loading="lazy">
                <div class="nft-info">
                    <h4>${nft.name}</h4>
                    <p>${nft.price} ETH</p>
                </div>
            </div>
        `).join('');
    }
}

/**
 * Load recent activity
 */
async function loadRecentActivity(account) {
    // Mock activity data
    const activities = [
        { type: 'mint', name: 'Classic Manhattan', time: '2 hours ago' },
        { type: 'sell', name: 'Tropical Sunset', time: '1 day ago' },
        { type: 'buy', name: 'Whiskey Sour', time: '3 days ago' }
    ];
    
    const activityContainer = document.querySelector('.activity-list');
    if (activityContainer) {
        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <i class="fas fa-${activity.type === 'mint' ? 'plus' : activity.type === 'sell' ? 'arrow-up' : 'arrow-down'}"></i>
                <span>${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} ${activity.name}</span>
                <span class="time">${activity.time}</span>
            </div>
        `).join('');
    }
}

/**
 * Update user info display
 */
function updateUserInfo(account, network) {
    const userAddressEl = document.querySelector('.user-address');
    const networkEl = document.querySelector('.user-network');
    
    if (userAddressEl) {
        userAddressEl.textContent = `${account.substring(0, 6)}...${account.substring(account.length - 4)}`;
    }
    
    if (networkEl && network) {
        networkEl.textContent = network.name;
    }
}

/**
 * Clear user data
 */
function clearUserData() {
    // Clear stats
    const statElements = document.querySelectorAll('[data-stat]');
    statElements.forEach(el => el.textContent = '0');
    
    // Clear NFT gallery
    const nftContainer = document.querySelector('.nft-gallery');
    if (nftContainer) {
        nftContainer.innerHTML = '<p>Connect your wallet to view your NFTs</p>';
    }
    
    // Clear activity
    const activityContainer = document.querySelector('.activity-list');
    if (activityContainer) {
        activityContainer.innerHTML = '<p>Connect your wallet to view activity</p>';
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Dashboard action functions
function createNewRecipe() {
    window.location.href = 'create.html';
}

function viewRecipes() {
    window.location.href = 'marketplace.html';
}

function manageLoyalty() {
    showNotification('Loyalty program coming soon!', 'info');
}

function viewFullCollection() {
    window.location.href = 'profile.html';
} 