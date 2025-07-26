// ID NFT Modal Handler
class IDNFTModal {
    constructor() {
        this.isModalOpen = false;
        this.selectedImage = null;
        this.contractAddress = null;
        this.userAddress = null;
        this.modalReady = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadModalHTML();
    }

    // Load modal HTML (deprecated - now redirects to dedicated page)
    async loadModalHTML() {
        // Modal HTML loading is no longer needed since we redirect to dedicated page
        console.log('loadModalHTML called - but now using dedicated page instead');
        this.modalReady = true;
        return;
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for wallet connect button clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('connect-btn') || 
                e.target.closest('.connect-btn')) {
                e.preventDefault();
                this.handleConnectWallet();
            }
        });
    }

    // Setup modal event listeners (deprecated)
    setupModalEventListeners() {
        const modal = document.getElementById('idnft-modal');
        if (!modal) return;

        // Close modal on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // Image upload (deprecated)
        const imageUploadArea = document.getElementById('image-upload-area');
        const imageInput = document.getElementById('bar-image');
        
        if (imageUploadArea && imageInput) {
            imageUploadArea.addEventListener('click', () => {
                imageInput.click();
            });

            imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }

        // Form submission (deprecated - redirects to dedicated page)
        const form = document.getElementById('idnft-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }
    }

    // Handle wallet connection
    async handleConnectWallet() {
        try {
            // First connect MetaMask
            const walletAddress = await this.connectMetaMask();
            if (!walletAddress) return;

            this.userAddress = walletAddress;
            
            // Initialize ID NFT service - using contract address from config
            try {
                await window.idnftService.initialize();
                this.contractAddress = window.idnftService.contractAddress;
            } catch (error) {
                console.error('Failed to initialize ID NFT service:', error);
                this.showError('Initialization failed', 'Unable to connect to ID NFT contract, please check network connection.');
                return;
            }
            
            // Check if user already has an ID NFT
            const idnftStatus = await window.idnftService.checkUserIDNFT(walletAddress);
            
            if (idnftStatus.hasActive) {
                // User already has an active ID NFT, login success
                this.handleLoginSuccess(walletAddress);
            } else {
                // User doesn't have ID NFT, show creation form
                this.showModal();
            }
        } catch (error) {
            console.error('Error handling wallet connection:', error);
            this.showError('Wallet connection failed', error.message);
        }
    }

    // Connect MetaMask - using centralized WalletService
    async connectMetaMask() {
        try {
            // 使用WalletService连接
            const result = await window.walletService.connect();
            return result.account;
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            
            // 根据错误类型显示适当的消息
            if (error.type === 'NOT_INSTALLED') {
                this.showError('MetaMask未找到', '请安装MetaMask浏览器扩展');
            } else {
            this.showError('连接MetaMask失败', error.message);
            }
            return null;
        }
    }

    // 获取合约地址
    getContractAddress() {
        // 优先从localStorage获取用户配置的合约地址
        const userContractAddress = localStorage.getItem('config_idnft_contract');
        if (userContractAddress) {
            return userContractAddress;
        }
        
        // 从全局配置获取
        const globalContractAddress = localStorage.getItem('idnft_contract_address');
        if (globalContractAddress) {
            return globalContractAddress;
        }
        
        // 从APP_CONFIG获取
        const configContractAddress = window.APP_CONFIG?.blockchain?.idnftContractAddress;
        if (configContractAddress && configContractAddress !== '0x...') {
            return configContractAddress;
        }
        
        return null;
    }

    // 显示弹窗
    showModal() {
        const modal = document.getElementById('idnft-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.isModalOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    // Public method to open modal - redirects to dedicated page
    async openModal() {
        try {
            // If user hasn't connected wallet, connect first
            if (!this.userAddress) {
                const walletAddress = await this.connectMetaMask();
                if (!walletAddress) return;
                this.userAddress = walletAddress;
            }

            // Check if user already has an ID NFT
            try {
                if (window.idnftService && window.idnftService.isInitialized) {
                    const idnftStatus = await window.idnftService.checkUserIDNFT(this.userAddress);
                    
                    if (idnftStatus.hasActive) {
                        alert('You already have an active Identity NFT. No need to create another one.');
                        return;
                    }
                }
            } catch (error) {
                console.warn('Could not check IDNFT status:', error);
                // Continue with creation
            }

            // Redirect to dedicated IDNFT creation page - improved path resolution
            const currentPath = window.location.pathname;
            let createIDNFTPath;
            
            if (currentPath.includes('/pages/')) {
                // If we're already in pages directory
                createIDNFTPath = 'create-idnft.html';
            } else if (currentPath.endsWith('/') || currentPath.endsWith('/index.html')) {
                // If we're in root directory
                createIDNFTPath = 'pages/create-idnft.html';
            } else {
                // Default fallback - try relative path
                createIDNFTPath = './pages/create-idnft.html';
            }
            
            console.log('Redirecting to IDNFT creation page:', createIDNFTPath);
            window.location.href = createIDNFTPath;
        } catch (error) {
            console.error('Error redirecting to IDNFT creation:', error);
            this.showError('Failed to open IDNFT creation page', error.message);
        }
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('idnft-modal');
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
            document.body.style.overflow = '';
        }
    }

    // Handle image upload (deprecated)
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showError('Invalid file type', 'Please select an image file');
            return;
        }

        // 验证文件大小 (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showError('文件过大', '图片大小不能超过5MB');
            return;
        }

        this.selectedImage = file;
        this.displayImagePreview(file);
    }

    // 显示图片预览
    displayImagePreview(file) {
        const reader = new FileReader();
        const preview = document.getElementById('image-preview');
        const placeholder = document.querySelector('.upload-placeholder');

        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        };

        reader.readAsDataURL(file);
    }

    // 提交表单
    async submitForm() {
        // This method is deprecated - form submission now happens on dedicated page
        console.warn('submitForm called on modal - redirecting to dedicated page');
        await this.openModal();
    }

    // 获取表单数据
    getFormData() {
        const form = document.getElementById('idnft-form');
        const formData = new FormData(form);
        
        return {
            barName: formData.get('barName'),
            barDescription: formData.get('barDescription'),
            barType: formData.get('barType'),
            establishmentYear: formData.get('establishmentYear'),
            barCountry: formData.get('barCountry'),
            barCity: formData.get('barCity'),
            specialties: formData.get('specialties'),
            awards: formData.get('awards'),
            instagram: formData.get('instagram'),
            website: formData.get('website'),
            contactEmail: formData.get('contactEmail')
        };
    }

    // 创建metadata
    createMetadata(formData, imageURI) {
        return {
            name: formData.barName,
            description: formData.barDescription || '',
            image: imageURI,
            attributes: [
                {
                    trait_type: "Bar Type",
                    value: formData.barType || "Unknown"
                },
                {
                    trait_type: "Establishment Year",
                    value: formData.establishmentYear || "Unknown"
                },
                {
                    trait_type: "Country",
                    value: formData.barCountry || "Unknown"
                },
                {
                    trait_type: "City",
                    value: formData.barCity || "Unknown"
                },
                {
                    trait_type: "Specialties",
                    value: formData.specialties || "Various"
                },
                {
                    trait_type: "Awards",
                    value: formData.awards || "None"
                }
            ],
            external_url: formData.website || "",
            social_media: {
                instagram: formData.instagram || "",
                website: formData.website || ""
            },
            contact: {
                email: formData.contactEmail || ""
            },
            created_at: new Date().toISOString()
        };
    }

    // 上传图片到IPFS - 使用后端API
    async uploadImageToIPFS(file) {
        try {
            // 使用bars API端点上传酒吧图片
            const formData = new FormData();
            formData.append('bar_image', file);
            
            const response = await fetch(`${window.apiService.baseUrl}/bars/upload_bar_ipfs`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            return result.ipfs_url || result.cid || result.url;
        } catch (error) {
            console.error('Failed to upload image to IPFS:', error);
            // Fallback to mock for development
            return `ipfs://mock_bar_image_${Date.now()}.jpg`;
        }
    }

    // 上传metadata到IPFS - 使用后端API
    async uploadMetadataToIPFS(metadata) {
        try {
            const response = await fetch(`${window.apiService.baseUrl}/bars/upload_bar_ipfs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ metadata: metadata })
            });
            
            if (!response.ok) {
                throw new Error(`Metadata upload failed: ${response.status}`);
            }
            
            const result = await response.json();
            return result.ipfs_url || result.cid || `ipfs://${result.cid}`;
        } catch (error) {
            console.error('Failed to upload metadata to IPFS:', error);
            // Fallback to mock for development
            return `ipfs://mock_bar_metadata_${Date.now()}.json`;
        }
    }

    // 创建ID NFT - 通过后端API
    async createIDNFT(metadataURI) {
        try {
            // ID NFT创建需要通过后端API，因为只有合约所有者可以调用createIDNFT
            const response = await fetch(`${window.apiService.baseUrl}/bars/create_id_nft`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_address: this.userAddress,
                    token_uri: metadataURI
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Creation failed: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error creating ID NFT:', error);
            throw new Error(`Failed to create ID NFT: ${error.message}`);
        }
    }

    // 显示表单状态
    showFormStatus(title, message) {
        const statusElement = document.getElementById('form-status');
        const statusText = document.getElementById('status-text');
        const submitBtn = document.getElementById('submit-idnft-btn');
        
        if (statusElement && statusText) {
            statusText.textContent = message;
            statusElement.style.display = 'block';
        }
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 处理中...';
        }
    }

    // 处理登录成功
    handleLoginSuccess(walletAddress) {
        console.log('IDNFTModal: Login success for address:', walletAddress);
        
        // WalletService已经处理了基本的连接信息存储
        // 这里只需存储IDNFT特定的信息，使用localStorage保持一致性
        localStorage.setItem('hasIDNFT', 'true');
        localStorage.setItem('idnft_verified_at', new Date().toISOString());
        
        // 显示成功消息
        this.showSuccess('连接成功！', `欢迎回来，${this.getShortAddress(walletAddress)}`);
        
        // 使用AuthManager进行导航
        setTimeout(() => {
            if (window.authManager) {
                window.authManager.redirectToIntendedDestination();
            } else {
                // Fallback navigation
                const targetPage = sessionStorage.getItem('intendedDestination') || 'pages/profile.html';
                window.location.href = targetPage;
            }
        }, 2000);
    }

    // 获取短地址格式（添加这个方法如果不存在）
    getShortAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    // 显示错误消息
    showError(title, message) {
        alert(`${title}: ${message}`);
    }

    // 显示成功消息
    showSuccess(title, message) {
        // 这里可以实现更美观的成功提示
        console.log(`${title}: ${message}`);
    }

    // Wait for modal to be ready
    async waitForModalReady() {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds max
        
        while (!this.modalReady && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!this.modalReady) {
            throw new Error('Modal failed to load');
        }
    }

    // Create fallback modal HTML directly
    createModalHTML() {
        return `
            <div id="idnft-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; justify-content: center; align-items: center;">
                <div class="modal-container" style="background: rgba(31, 41, 55, 0.95); padding: 2rem; border-radius: 20px; border: 1px solid rgba(55, 65, 81, 0.3); max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
                    <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                        <h3 style="color: #25f2f2; margin: 0;"><i class="fas fa-id-card"></i> Create Bar Identity NFT</h3>
                        <button class="modal-close" onclick="closeIDNFTModal()" style="background: none; border: none; color: #9ca3af; font-size: 1.5rem; cursor: pointer;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="form-section">
                            <p style="color: #9ca3af; margin-bottom: 1.5rem;">
                                Welcome to BarsHelpBars! To gain full platform access, you need to create a Bar Identity NFT. Please fill out the information below to create your unique identity.
                            </p>
                            
                            <form id="idnft-form" class="idnft-form">
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label for="bar-name" style="display: block; color: #f9fafb; margin-bottom: 0.5rem;">Bar Name *</label>
                                    <input type="text" id="bar-name" name="barName" required 
                                           placeholder="e.g., The Golden Bar"
                                           style="width: 100%; padding: 0.75rem; border: 1px solid rgba(55, 65, 81, 0.3); border-radius: 8px; background: rgba(0, 0, 0, 0.3); color: #f9fafb;">
                                </div>
                                
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label for="bar-description" style="display: block; color: #f9fafb; margin-bottom: 0.5rem;">Bar Description</label>
                                    <textarea id="bar-description" name="barDescription" rows="3"
                                              placeholder="Describe your bar's specialties, style, or philosophy..."
                                              style="width: 100%; padding: 0.75rem; border: 1px solid rgba(55, 65, 81, 0.3); border-radius: 8px; background: rgba(0, 0, 0, 0.3); color: #f9fafb;"></textarea>
                                </div>
                                
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label for="bar-city" style="display: block; color: #f9fafb; margin-bottom: 0.5rem;">City</label>
                                    <input type="text" id="bar-city" name="barCity" 
                                           placeholder="e.g., New York"
                                           style="width: 100%; padding: 0.75rem; border: 1px solid rgba(55, 65, 81, 0.3); border-radius: 8px; background: rgba(0, 0, 0, 0.3); color: #f9fafb;">
                                </div>
                                
                                <div class="form-group" style="margin-bottom: 1rem;">
                                    <label for="bar-image" style="display: block; color: #f9fafb; margin-bottom: 0.5rem;">Bar Image</label>
                                    <input type="file" id="bar-image" name="barImage" accept="image/*"
                                           style="width: 100%; padding: 0.75rem; border: 1px solid rgba(55, 65, 81, 0.3); border-radius: 8px; background: rgba(0, 0, 0, 0.3); color: #f9fafb;">
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <div class="modal-footer" style="margin-top: 1.5rem;">
                        <div class="modal-actions" style="display: flex; gap: 1rem; justify-content: flex-end;">
                            <button type="button" onclick="closeIDNFTModal()" 
                                    style="background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-times"></i> Cancel
                            </button>
                            <button type="button" onclick="submitIDNFTForm()" id="submit-idnft-btn"
                                    style="background: rgba(37, 242, 242, 0.1); color: #25f2f2; border: 1px solid rgba(37, 242, 242, 0.3); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer;">
                                <i class="fas fa-magic"></i> Create ID NFT
                            </button>
                        </div>
                        
                        <div class="form-status" id="form-status" style="display: none; margin-top: 1rem; padding: 1rem; background: rgba(59, 130, 246, 0.1); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px;">
                            <div class="status-content" style="display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-spinner fa-spin" id="status-icon" style="color: #3b82f6;"></i>
                                <span id="status-text" style="color: #3b82f6;">Processing...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create fallback modal when HTML loading fails
    createFallbackModal() {
        const html = this.createModalHTML();
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = html;
        document.body.appendChild(modalContainer.firstElementChild);
        this.setupModalEventListeners();
        this.modalReady = true;
    }

    // Show simple form for IDNFT creation
    showSimpleForm() {
        if (!this.modalReady) {
            this.createFallbackModal();
        }
        this.showModal();
    }
}

// 全局函数
function closeIDNFTModal() {
    if (window.idnftModal) {
        window.idnftModal.closeModal();
    }
}

function submitIDNFTForm() {
    if (window.idnftModal) {
        window.idnftModal.submitForm();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    window.idnftModal = new IDNFTModal();
}); 