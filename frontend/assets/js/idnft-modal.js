// ID NFT Modal Handler
class IDNFTModal {
    constructor() {
        this.isModalOpen = false;
        this.selectedImage = null;
        this.contractAddress = null;
        this.userAddress = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadModalHTML();
    }

    // 加载弹窗HTML
    async loadModalHTML() {
        try {
            const response = await fetch('../components/idnft-modal.html');
            const html = await response.text();
            
            // 将弹窗HTML添加到页面
            const modalContainer = document.createElement('div');
            modalContainer.innerHTML = html;
            document.body.appendChild(modalContainer.firstElementChild);
            
            this.setupModalEventListeners();
        } catch (error) {
            console.error('Failed to load modal HTML:', error);
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听连接钱包按钮点击
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('connect-btn') || 
                e.target.closest('.connect-btn')) {
                e.preventDefault();
                this.handleConnectWallet();
            }
        });
    }

    // 设置弹窗事件监听器
    setupModalEventListeners() {
        const modal = document.getElementById('idnft-modal');
        if (!modal) return;

        // 关闭弹窗
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });

        // 图片上传
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

        // 表单提交
        const form = document.getElementById('idnft-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }
    }

    // 处理连接钱包
    async handleConnectWallet() {
        try {
            // 首先连接MetaMask
            const walletAddress = await this.connectMetaMask();
            if (!walletAddress) return;

            this.userAddress = walletAddress;
            
            // 检查是否有ID NFT合约地址配置
            this.contractAddress = this.getContractAddress();
            if (!this.contractAddress) {
                if (confirm('检测到您还没有配置ID NFT合约地址。是否前往配置页面进行设置？')) {
                    window.location.href = 'config.html';
                }
                return;
            }

            // 初始化ID NFT服务
            await window.idnftService.initialize(this.contractAddress);
            
            // 检查用户是否已有ID NFT
            const idnftStatus = await window.idnftService.checkUserIDNFT(walletAddress);
            
            if (idnftStatus.hasActive) {
                // 用户已有活跃的ID NFT，直接登录成功
                this.handleLoginSuccess(walletAddress);
            } else {
                // 用户没有ID NFT，显示创建表单
                this.showModal();
            }
        } catch (error) {
            console.error('Error handling wallet connection:', error);
            this.showError('连接钱包失败', error.message);
        }
    }

    // 连接MetaMask - 使用集中化的WalletService
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

    // 关闭弹窗
    closeModal() {
        const modal = document.getElementById('idnft-modal');
        if (modal) {
            modal.style.display = 'none';
            this.isModalOpen = false;
            document.body.style.overflow = '';
        }
    }

    // 处理图片上传
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            this.showError('文件类型错误', '请选择图片文件');
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
        try {
            this.showFormStatus('正在处理...', '正在创建您的ID NFT...');
            
            // 获取表单数据
            const formData = this.getFormData();
            
            // 验证必填字段
            if (!formData.barName) {
                throw new Error('酒吧名称是必填项');
            }

            // 上传图片到IPFS（如果有）
            let imageURI = '';
            if (this.selectedImage) {
                imageURI = await this.uploadImageToIPFS(this.selectedImage);
            }

            // 创建metadata
            const metadata = this.createMetadata(formData, imageURI);
            
            // 上传metadata到IPFS
            const metadataURI = await this.uploadMetadataToIPFS(metadata);
            
            // 创建ID NFT
            await this.createIDNFT(metadataURI);
            
            // 显示成功消息
            this.showFormStatus('创建成功！', '您的ID NFT已创建成功，正在跳转...');
            
            // 延迟后关闭弹窗并跳转
            setTimeout(() => {
                this.closeModal();
                this.handleLoginSuccess(this.userAddress);
            }, 2000);
            
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showFormStatus('创建失败', error.message);
        }
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

    // 上传图片到IPFS（模拟）
    async uploadImageToIPFS(file) {
        // 这里应该实现真正的IPFS上传
        // 目前返回一个模拟的URI
        return `ipfs://mock_image_${Date.now()}.jpg`;
    }

    // 上传metadata到IPFS（模拟）
    async uploadMetadataToIPFS(metadata) {
        // 这里应该实现真正的IPFS上传
        // 目前返回一个模拟的URI
        return `ipfs://mock_metadata_${Date.now()}.json`;
    }

    // 创建ID NFT
    async createIDNFT(metadataURI) {
        try {
            // 注意：在实际应用中，这个操作通常通过后端API来完成
            // 因为createIDNFT函数只能由合约所有者调用
            const receipt = await window.idnftService.createIDNFT(this.userAddress, metadataURI);
            return receipt;
        } catch (error) {
            console.error('Error creating ID NFT:', error);
            throw new Error('创建ID NFT失败，请稍后重试');
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
        // WalletService已经处理了基本的连接信息存储
        // 这里只需存储IDNFT特定的信息
        localStorage.setItem('hasIDNFT', 'true');
        
        // 显示成功消息
        this.showSuccess('连接成功！', `欢迎回来，${window.idnftService.getShortAddress(walletAddress)}`);
        
        // 使用AuthManager进行导航
        setTimeout(() => {
            window.authManager.redirectToIntendedDestination();
        }, 2000);
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