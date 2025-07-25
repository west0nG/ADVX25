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

    // Enhanced NFT data with more alcohol/cocktail varieties
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
        },
        {
            id: 7,
            name: "Smoky Whisper",
            image: "https://static.paraflowcontent.com/public/resource/image/8b4a2f6c-1823-4d9e-b547-2f8e9c4a6b7f.jpeg",
            price: "0.92",
            creator: "@WhiskeyMaster",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/3c7b1d9e-4f2a-6c8d-a9b1-5e3f7g9h1i2j.jpeg",
            category: "classic",
            tokenId: "156"
        },
        {
            id: 8,
            name: "Crystal Clarity",
            image: "https://static.paraflowcontent.com/public/resource/image/2b4d6f8h-0j1k-3l5m-7n9o-1p3q5r7s9t1u.jpeg",
            price: "2.1",
            creator: "@CrystalCraft",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/4f6h8j0l-2m4n-6o8p-0q2r-4s6t8u0v2w4x.jpeg",
            category: "modern",
            tokenId: "301"
        },
        {
            id: 9,
            name: "Ruby Fizz",
            image: "https://static.paraflowcontent.com/public/resource/image/6h8j0l2n-4o6p-8q0r-2s4t-6u8v0w2x4y6z.jpeg",
            price: "0.67",
            creator: "@RubyMixologist",
            creatorAvatar: "https://static.paraflowcontent.com/public/resource/image/8j0l2n4p-6q8r-0s2t-4u6v-8w0x2y4z6a8b.jpeg",
            category: "modern",
            tokenId: "145"
        },
        {
            id: 10,
            name: "Emerald Mist",
            image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=400&fit=crop",
            price: "1.35",
            creator: "@EmeraldBarman",
            creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "289"
        },
        {
            id: 11,
            name: "Vintage Martini",
            image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=400&fit=crop",
            price: "0.78",
            creator: "@VintageSoul",
            creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            category: "classic",
            tokenId: "067"
        },
        {
            id: 12,
            name: "Tropical Storm",
            image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop",
            price: "0.89",
            creator: "@StormMixer",
            creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "234"
        },
        {
            id: 13,
            name: "Lavender Dream",
            image: "https://images.unsplash.com/photo-1571104508999-893933ded431?w=400&h=400&fit=crop",
            price: "0.56",
            creator: "@FloralMix",
            creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b2e12dff?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "178"
        },
        {
            id: 14,
            name: "Bourbon Blaze",
            image: "https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400&h=400&fit=crop",
            price: "1.45",
            creator: "@BourbonKing",
            creatorAvatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=100&h=100&fit=crop&crop=face",
            category: "classic",
            tokenId: "456"
        },
        {
            id: 15,
            name: "Cucumber Zen",
            image: "https://images.unsplash.com/photo-1546171753-97d7676e4602?w=400&h=400&fit=crop",
            price: "0.34",
            creator: "@ZenMaster",
            creatorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
            category: "non-alcoholic",
            tokenId: "923"
        },
        {
            id: 16,
            name: "Passion Fruit Paradise",
            image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
            price: "0.82",
            creator: "@PassionMixer",
            creatorAvatar: "https://images.unsplash.com/photo-1464863979621-258859e62245?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "567"
        },
        {
            id: 17,
            name: "Midnight Oil",
            image: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&h=400&fit=crop",
            price: "1.67",
            creator: "@MidnightMixer",
            creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "789"
        },
        {
            id: 18,
            name: "Ginger Spark",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop",
            price: "0.43",
            creator: "@SpiceAlchemist",
            creatorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
            category: "non-alcoholic",
            tokenId: "345"
        },
        {
            id: 19,
            name: "Old Fashioned Royale",
            image: "https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=400&h=400&fit=crop",
            price: "1.23",
            creator: "@RoyalMixology",
            creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
            category: "classic",
            tokenId: "012"
        },
        {
            id: 20,
            name: "Electric Lime",
            image: "https://images.unsplash.com/photo-1541188495357-ad2dc89487f4?w=400&h=400&fit=crop",
            price: "0.91",
            creator: "@ElectricMix",
            creatorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "654"
        },
        {
            id: 21,
            name: "Coconut Breeze",
            image: "https://images.unsplash.com/photo-1568909344668-6f14a07b56ce?w=400&h=400&fit=crop",
            price: "0.76",
            creator: "@CoconutKing",
            creatorAvatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "987"
        },
        {
            id: 22,
            name: "Herbal Elixir",
            image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop",
            price: "0.52",
            creator: "@HerbalWizard",
            creatorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b2e12dff?w=100&h=100&fit=crop&crop=face",
            category: "non-alcoholic",
            tokenId: "321"
        },
        {
            id: 23,
            name: "Smoky Mezcal Dreams",
            image: "https://images.unsplash.com/photo-1613743983303-b3e89f8a2b80?w=400&h=400&fit=crop",
            price: "1.89",
            creator: "@MezcalMaestro",
            creatorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
            category: "modern",
            tokenId: "111"
        },
        {
            id: 24,
            name: "Golden Margarita",
            image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=400&fit=crop",
            price: "0.68",
            creator: "@MargaritaMaster",
            creatorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
            category: "tropical",
            tokenId: "222"
        }
    ];

    let currentPage = 1;
    let itemsPerPage = 12; // Increased to show more items per page
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
        
        if (!nftGrid) {
            console.error('NFT grid element not found!');
            return;
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageNFTs = filteredNFTs.slice(startIndex, endIndex);

        console.log('Rendering', pageNFTs.length, 'NFTs');

        nftGrid.innerHTML = '';
        nftGrid.classList.remove('visible');

        pageNFTs.forEach((nft, index) => {
            const nftCard = createNFTCard(nft);
            nftGrid.appendChild(nftCard);
            console.log('Added NFT card:', nft.name);
        });

        // Make cards visible immediately and add animation class
        nftGrid.classList.add('visible');
        
        // Force a reflow to ensure visibility
        nftGrid.offsetHeight;

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