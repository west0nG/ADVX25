// Marketplace functionality
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

    // Sample NFT data
    const nftData = [
        {
            id: 1,
            name: "The Perfect Manhattan",
            image: "https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg",
            price: "0.58",
            creator: "@ClassicMixologist",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/9ffa451d-8264-4d87-aad6-ae32c8965066.jpeg",
            category: "classic",
            tokenId: "024"
        },
        {
            id: 2,
            name: "Neon Dreams",
            image: "https://static.paraflowcontent.com/public/resource/image/e54f339e-235e-4246-a4f7-6cb0f21d2ca6.jpeg",
            price: "1.2",
            creator: "@FutureMix",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/92eb35ba-c295-406e-ba06-3ff38ef83dc8.jpeg",
            category: "modern",
            tokenId: "107"
        },
        {
            id: 3,
            name: "Island Paradise",
            image: "https://static.paraflowcontent.com/public/resource/image/48343c70-7eb5-4fa2-9816-f4ef4e162411.jpeg",
            price: "0.75",
            creator: "@TikiMaster",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/d5298df2-1d97-499a-b761-38a5a9db07ac.jpeg",
            category: "tropical",
            tokenId: "089"
        },
        {
            id: 4,
            name: "Midnight Espresso",
            image: "https://static.paraflowcontent.com/public/resource/image/332d64f2-579a-484c-995b-1079a0f9ca5f.jpeg",
            price: "0.45",
            creator: "@CoffeeAlchemist",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/9ffa451d-8264-4d87-aad6-ae32c8965066.jpeg",
            category: "non-alcoholic",
            tokenId: "156"
        },
        {
            id: 5,
            name: "Golden Sunset",
            image: "https://static.paraflowcontent.com/public/resource/image/ba8d3a63-545f-4315-84ed-cdec7398b05c.jpeg",
            price: "0.92",
            creator: "@SunsetMixer",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/92eb35ba-c295-406e-ba06-3ff38ef83dc8.jpeg",
            category: "tropical",
            tokenId: "203"
        },
        {
            id: 6,
            name: "Arctic Breeze",
            image: "https://static.paraflowcontent.com/public/resource/image/7f49f0a0-2563-4404-b3af-ed545f45f183.jpeg",
            price: "1.5",
            creator: "@IceMaster",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/d5298df2-1d97-499a-b761-38a5a9db07ac.jpeg",
            category: "modern",
            tokenId: "078"
        }
    ];

    let currentPage = 1;
    let itemsPerPage = 6;
    let filteredNFTs = [...nftData];

    // Initialize marketplace
    function initMarketplace() {
        renderNFTs();
        setupFilters();
        setupSearch();
        setupPagination();
    }

    // Render NFTs
    function renderNFTs() {
        const nftGrid = document.getElementById('nft-grid');
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNFTs = filteredNFTs.slice(startIndex, endIndex);

        nftGrid.innerHTML = '';

        pageNFTs.forEach(nft => {
            const nftCard = createNFTCard(nft);
            nftGrid.appendChild(nftCard);
        });

        updatePagination();
    }

    // Create NFT card
    function createNFTCard(nft) {
        const card = document.createElement('div');
        card.className = 'nft-card';
        card.innerHTML = `
            <div style="position: relative;">
                <img src="${nft.image}" alt="${nft.name}" class="nft-image">
                <div class="nft-price">${nft.price} ETH</div>
            </div>
            <div class="nft-info">
                <h3>${nft.name}</h3>
                <div class="nft-creator">
                    <img src="${nft.creatorAvatar}" alt="Creator" class="creator-avatar">
                    <span>${nft.creator}</span>
                    <span style="margin-left: auto; color: #9ca3af;">#${nft.tokenId}</span>
                </div>
            </div>
        `;

        // Add click event for NFT details
        card.addEventListener('click', () => {
            showNFTDetails(nft);
        });

        return card;
    }

    // Show NFT details modal
    function showNFTDetails(nft) {
        // Create modal
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
                        <button class="btn-primary">Buy Now</button>
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

        // Add modal styles
        const style = document.createElement('style');
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

    // Setup filters
    function setupFilters() {
        const filterOptions = document.querySelectorAll('.filter-option');
        const sortSelect = document.querySelector('.sort-select');

        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options in the same group
                const group = option.closest('.filter-options');
                group.querySelectorAll('.filter-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                applyFilters();
            });
        });

        sortSelect.addEventListener('change', applyFilters);
    }

    // Apply filters
    function applyFilters() {
        const categoryFilter = document.querySelector('.filter-option[data-category].active').dataset.category;
        const priceFilter = document.querySelector('.filter-option[data-price].active').dataset.price;
        const sortBy = document.querySelector('.sort-select').value;

        // Filter by category
        filteredNFTs = nftData.filter(nft => {
            if (categoryFilter !== 'all' && nft.category !== categoryFilter) return false;
            return true;
        });

        // Filter by price
        if (priceFilter !== 'all') {
            const [min, max] = priceFilter.split('-').map(Number);
            filteredNFTs = filteredNFTs.filter(nft => {
                const price = parseFloat(nft.price);
                if (max) {
                    return price >= min && price < max;
                } else {
                    return price >= min;
                }
            });
        }

        // Sort
        filteredNFTs.sort((a, b) => {
            switch (sortBy) {
                case 'price-low':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-high':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'oldest':
                    return a.id - b.id;
                case 'newest':
                    return b.id - a.id;
                default:
                    return 0;
            }
        });

        currentPage = 1;
        renderNFTs();
    }

    // Setup search
    function setupSearch() {
        const searchInput = document.querySelector('.search-box input');
        let searchTimeout;

        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                
                if (searchTerm) {
                    filteredNFTs = nftData.filter(nft => 
                        nft.name.toLowerCase().includes(searchTerm) ||
                        nft.creator.toLowerCase().includes(searchTerm) ||
                        nft.category.toLowerCase().includes(searchTerm)
                    );
                } else {
                    filteredNFTs = [...nftData];
                }

                currentPage = 1;
                renderNFTs();
            }, 300);
        });
    }

    // Setup pagination
    function setupPagination() {
        const pagination = document.querySelector('.pagination');
        
        pagination.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn')) {
                const page = e.target.dataset.page;
                
                if (page === 'prev' && currentPage > 1) {
                    currentPage--;
                } else if (page === 'next' && currentPage < Math.ceil(filteredNFTs.length / itemsPerPage)) {
                    currentPage++;
                } else if (page !== 'prev' && page !== 'next') {
                    currentPage = parseInt(page);
                }
                
                renderNFTs();
            }
        });
    }

    // Update pagination
    function updatePagination() {
        const totalPages = Math.ceil(filteredNFTs.length / itemsPerPage);
        const pageNumbers = document.querySelector('.page-numbers');
        const prevBtn = document.querySelector('.pagination-btn[data-page="prev"]');
        const nextBtn = document.querySelector('.pagination-btn[data-page="next"]');

        // Update page numbers
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.className = 'pagination-btn';
            btn.dataset.page = i;
            btn.textContent = i;
            if (i === currentPage) btn.classList.add('active');
            pageNumbers.appendChild(btn);
        }

        // Update prev/next buttons
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages;

        if (prevBtn.disabled) prevBtn.style.opacity = '0.5';
        else prevBtn.style.opacity = '1';

        if (nextBtn.disabled) nextBtn.style.opacity = '0.5';
        else nextBtn.style.opacity = '1';
    }

    // Initialize
    initMarketplace();
}); 