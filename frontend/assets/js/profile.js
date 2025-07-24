// Profile functionality
document.addEventListener('DOMContentLoaded', function() {
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Sample user data
    const userData = {
        username: "@CocktailCreator",
        bio: "Passionate mixologist creating unique cocktail experiences",
        email: "creator@example.com",
        walletAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
        stats: {
            created: 24,
            collected: 156,
            earned: "2.4"
        },
        nfts: [
            {
                id: 1,
                name: "The Perfect Manhattan",
                image: "https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg",
                price: "0.58",
                creator: "@ClassicMixologist",
                creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/9ffa451d-8264-4d87-aad6-ae32c8965066.jpeg",
                category: "classic",
                tokenId: "024",
                owned: true
            },
            {
                id: 2,
                name: "Neon Dreams",
                image: "https://static.paraflowcontent.com/public/resource/image/e54f339e-235e-4246-a4f7-6cb0f21d2ca6.jpeg",
                price: "1.2",
                creator: "@FutureMix",
                creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/92eb35ba-c295-406e-ba06-3ff38ef83dc8.jpeg",
                category: "modern",
                tokenId: "107",
                owned: true
            },
            {
                id: 3,
                name: "Island Paradise",
                image: "https://static.paraflowcontent.com/public/resource/image/48343c70-7eb5-4fa2-9816-f4ef4e162411.jpeg",
                price: "0.75",
                creator: "@TikiMaster",
                creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/d5298df2-1d97-499a-b761-38a5a9db07ac.jpeg",
                category: "tropical",
                tokenId: "089",
                owned: true
            }
        ],
        created: [
            {
                id: 4,
                name: "Midnight Espresso",
                image: "https://static.paraflowcontent.com/public/resource/image/332d64f2-579a-484c-995b-1079a0f9ca5f.jpeg",
                price: "0.45",
                creator: "@CocktailCreator",
                creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/9ffa451d-8264-4d87-aad6-ae32c8965066.jpeg",
                category: "non-alcoholic",
                tokenId: "156",
                owned: false
            },
            {
                id: 5,
                name: "Golden Sunset",
                image: "https://static.paraflowcontent.com/public/resource/image/ba8d3a63-545f-4315-84ed-cdec7398b05c.jpeg",
                price: "0.92",
                creator: "@CocktailCreator",
                creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/92eb35ba-c295-406e-ba06-3ff38ef83dc8.jpeg",
                category: "tropical",
                tokenId: "203",
                owned: false
            }
        ]
    };

    // Initialize profile
    function initProfile() {
        setupTabSwitching();
        loadUserNFTs();
        setupViewOptions();
        setupSettingsForm();
    }

    // Setup tab switching
    function setupTabSwitching() {
        const tabs = document.querySelectorAll('.profile-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                
                // Remove active class from all tabs and contents
                tabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Load content based on tab
                switch(targetTab) {
                    case 'nfts':
                        loadUserNFTs();
                        break;
                    case 'created':
                        loadCreatedNFTs();
                        break;
                    case 'transactions':
                        // Transactions are already loaded in HTML
                        break;
                    case 'settings':
                        loadUserSettings();
                        break;
                }
            });
        });
    }

    // Load user's NFTs
    function loadUserNFTs() {
        const nftGrid = document.getElementById('my-nfts-grid');
        nftGrid.innerHTML = '';

        userData.nfts.forEach(nft => {
            const nftCard = createNFTCard(nft, true);
            nftGrid.appendChild(nftCard);
        });
    }

    // Load created NFTs
    function loadCreatedNFTs() {
        const nftGrid = document.getElementById('created-nfts-grid');
        nftGrid.innerHTML = '';

        userData.created.forEach(nft => {
            const nftCard = createNFTCard(nft, false);
            nftGrid.appendChild(nftCard);
        });
    }

    // Create NFT card
    function createNFTCard(nft, isOwned) {
        const card = document.createElement('div');
        card.className = 'nft-card';
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-price">${nft.price} ETH</div>
                ${isOwned ? '<div style="position: absolute; top: 1rem; left: 1rem; background: rgba(34, 197, 94, 0.9); color: #0a0f1a; padding: 0.25rem 0.5rem; border-radius: 10px; font-size: 0.75rem; font-weight: 600;">OWNED</div>' : ''}
            </div>
            <div class="nft-info">
                <h3>${nft.name}</h3>
                <div class="nft-creator">
                    <img src="${nft.creatorAvatar}" alt="Creator" class="creator-avatar">
                    <span>${nft.creator}</span>
                    <span style="margin-left: auto; color: #9ca3af;">#${nft.tokenId}</span>
                </div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn-secondary" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">View Recipe</button>
                    ${isOwned ? '<button class="btn-primary" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">Sell</button>' : '<button class="btn-primary" style="flex: 1; padding: 0.5rem; font-size: 0.875rem;">Edit</button>'}
                </div>
            </div>
        `;

        // Add click event for NFT details
        card.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                showNFTDetails(nft);
            }
        });

        return card;
    }

    // Show NFT details modal
    function showNFTDetails(nft) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${nft.name}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <img src="${nft.image}" alt="${nft.name}" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                    <div class="nft-details">
                        <p><strong>Creator:</strong> ${nft.creator}</p>
                        <p><strong>Token ID:</strong> #${nft.tokenId}</p>
                        <p><strong>Category:</strong> ${nft.category}</p>
                        <p><strong>Price:</strong> ${nft.price} ETH</p>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-secondary">View Recipe</button>
                        <button class="btn-primary">${nft.owned ? 'Sell NFT' : 'Edit NFT'}</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        const overlay = modal.querySelector('.modal-overlay');
        
        closeBtn.addEventListener('click', () => modal.remove());
        overlay.addEventListener('click', () => modal.remove());

        // Add modal styles if not already present
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                }
                .modal-content {
                    background: rgba(31, 41, 55, 0.95);
                    border-radius: 20px;
                    padding: 2rem;
                    max-width: 500px;
                    width: 90%;
                    position: relative;
                    border: 1px solid rgba(55, 65, 81, 0.3);
                }
                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                .modal-close {
                    background: none;
                    border: none;
                    color: #9ca3af;
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .modal-close:hover {
                    color: #25f2f2;
                }
                .nft-details {
                    margin: 1rem 0;
                }
                .nft-details p {
                    margin-bottom: 0.5rem;
                    color: #9ca3af;
                }
                .modal-actions {
                    display: flex;
                    gap: 1rem;
                    margin-top: 1.5rem;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Setup view options
    function setupViewOptions() {
        const viewBtns = document.querySelectorAll('.view-btn');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                const activeTab = document.querySelector('.tab-content.active');
                const nftGrid = activeTab.querySelector('.nft-grid');
                
                // Remove active class from all view buttons
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Apply view style
                if (view === 'list') {
                    nftGrid.style.gridTemplateColumns = '1fr';
                    nftGrid.style.gap = '1rem';
                } else {
                    nftGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(300px, 1fr))';
                    nftGrid.style.gap = '2rem';
                }
            });
        });
    }

    // Load user settings
    function loadUserSettings() {
        // Settings are already loaded in HTML, but we can add functionality here
        const settingsForm = document.querySelector('.settings-form');
        const saveBtn = settingsForm.querySelector('.btn-primary');
        
        saveBtn.addEventListener('click', saveSettings);
    }

    // Save settings
    function saveSettings() {
        const username = document.getElementById('username').value;
        const bio = document.getElementById('bio').value;
        const email = document.getElementById('email').value;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }

        // Simulate API call
        const saveBtn = document.querySelector('.settings-form .btn-primary');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        saveBtn.disabled = true;

        setTimeout(() => {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
            showNotification('Settings saved successfully!', 'success');
        }, 1500);
    }

    // Setup settings form
    function setupSettingsForm() {
        const disconnectBtn = document.querySelector('.wallet-info .btn-secondary');
        
        disconnectBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to disconnect your wallet?')) {
                showNotification('Wallet disconnected successfully', 'success');
                // Here you would typically redirect to login or update the UI
            }
        });
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // Style based on type
        const colors = {
            success: '#22c55e',
            error: '#ef4444',
            info: '#25f2f2'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(31, 41, 55, 0.95);
            color: ${colors[type]};
            padding: 1rem 1.5rem;
            border-radius: 10px;
            border: 1px solid ${colors[type]};
            z-index: 10001;
            max-width: 300px;
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
        `;

        document.body.appendChild(notification);

        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Initialize
    initProfile();
}); 