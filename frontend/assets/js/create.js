// Create NFT functionality
document.addEventListener('DOMContentLoaded', function() {
    
    // Wait for ethers library to be loaded
    function waitForEthers() {
        return new Promise((resolve) => {
            if (typeof ethers !== 'undefined') {
                resolve();
            } else {
                const checkEthers = setInterval(() => {
                    if (typeof ethers !== 'undefined') {
                        clearInterval(checkEthers);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkEthers);
                    resolve();
                }, 10000);
            }
        });
    }
    // Header scroll effect
    window.addEventListener('scroll', () => {
        const header = document.getElementById('header');
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Initialize create form
    function initCreateForm() {
        setupFormValidation();
        setupImageUpload();
        setupDynamicFields();
        setupFormSubmission();
    }

    // Setup form validation
    function setupFormValidation() {
        const form = document.getElementById('create-form');
        const inputs = form.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            input.addEventListener('blur', validateField);
            input.addEventListener('input', clearFieldError);
        });
    }

    // Validate individual field
    function validateField(e) {
        const field = e.target;
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        clearFieldError(e);

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Specific validations
        if (field.name === 'price' && value) {
            const price = parseFloat(value);
            if (isNaN(price) || price < 0) {
                isValid = false;
                errorMessage = 'Please enter a valid price';
            }
        }

        if (field.name === 'royalties' && value) {
            const royalties = parseFloat(value);
            if (isNaN(royalties) || royalties < 0 || royalties > 50) {
                isValid = false;
                errorMessage = 'Royalties must be between 0 and 50%';
            }
        }

        if (field.name === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }

        // Show error if invalid
        if (!isValid) {
            showFieldError(field, errorMessage);
        }

        return isValid;
    }

    // Show field error
    function showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';

        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#ef4444';
    }

    // Clear field error
    function clearFieldError(e) {
        const field = e.target;
        const errorDiv = field.parentNode.querySelector('.field-error');
        
        if (errorDiv) {
            errorDiv.remove();
        }
        
        field.style.borderColor = '';
    }

    // Setup image upload
    function setupImageUpload() {
        const fileInput = document.getElementById('cocktail-image');
        const uploadArea = document.getElementById('upload-area');

        // Drag and drop functionality
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '#25f2f2';
            uploadArea.style.background = 'rgba(37, 242, 242, 0.1)';
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = '';
            uploadArea.style.background = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    // Handle file selection
    function handleFileSelect(file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('File size must be less than 10MB', 'error');
            return;
        }

        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            const uploadArea = document.getElementById('upload-area');
            uploadArea.innerHTML = `
                <img src="${e.target.result}" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 10px;">
                <p style="margin-top: 1rem; color: #25f2f2;">Image selected: ${file.name}</p>
            `;
        };
        reader.readAsDataURL(file);
    }

    // Setup dynamic fields
    function setupDynamicFields() {
        // Add ingredient functionality
        window.addIngredient = function() {
            const ingredientsList = document.getElementById('ingredients-list');
            const newIngredient = document.createElement('div');
            newIngredient.className = 'ingredient-item';
            newIngredient.innerHTML = `
                <input type="text" name="ingredients[]" placeholder="e.g., 2 oz Gin" required class="form-input">
                <button type="button" class="remove-btn" onclick="removeIngredient(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            ingredientsList.appendChild(newIngredient);
        };

        // Add instruction functionality
        window.addInstruction = function() {
            const instructionsList = document.getElementById('instructions-list');
            const newInstruction = document.createElement('div');
            newInstruction.className = 'instruction-item';
            newInstruction.innerHTML = `
                <input type="text" name="instructions[]" placeholder="e.g., Fill shaker with ice" required class="form-input">
                <button type="button" class="remove-btn" onclick="removeInstruction(this)">
                    <i class="fas fa-times"></i>
                </button>
            `;
            instructionsList.appendChild(newInstruction);
        };

        // Remove ingredient functionality
        window.removeIngredient = function(button) {
            const ingredientsList = document.getElementById('ingredients-list');
            if (ingredientsList.children.length > 1) {
                button.parentNode.remove();
            } else {
                showNotification('At least one ingredient is required', 'error');
            }
        };

        // Remove instruction functionality
        window.removeInstruction = function(button) {
            const instructionsList = document.getElementById('instructions-list');
            if (instructionsList.children.length > 1) {
                button.parentNode.remove();
            } else {
                showNotification('At least one instruction step is required', 'error');
            }
        };
    }

    // Setup form submission
    function setupFormSubmission() {
        const form = document.getElementById('create-form');
        
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateForm()) {
                submitForm();
            }
        });
    }

    // Validate entire form
    function validateForm() {
        const form = document.getElementById('create-form');
        const inputs = form.querySelectorAll('input, textarea, select');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });

        // Validate ingredients and instructions
        const ingredients = document.querySelectorAll('input[name="ingredients[]"]');
        const instructions = document.querySelectorAll('input[name="instructions[]"]');

        if (ingredients.length === 0) {
            showNotification('At least one ingredient is required', 'error');
            isValid = false;
        }

        if (instructions.length === 0) {
            showNotification('At least one instruction step is required', 'error');
            isValid = false;
        }

        // Validate image
        const imageInput = document.getElementById('cocktail-image');
        if (!imageInput.files.length) {
            showNotification('Please select an image for your cocktail', 'error');
            isValid = false;
        }

        return isValid;
    }

    // Submit form
    async function submitForm() {
        const form = document.getElementById('create-form');
        const formData = new FormData(form);

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting to wallet...';
        submitBtn.disabled = true;

        try {
            // Step 0: Wait for ethers to be loaded
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading libraries...';
            await waitForEthers();
            
            if (typeof ethers === 'undefined') {
                throw new Error('Ethers library failed to load. Please refresh the page and try again.');
            }

            // Step 1: Connect to wallet and get signer
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting to wallet...';
            if (typeof window.ethereum === 'undefined') {
                throw new Error('MetaMask is not installed. Please install it to continue.');
            }
            
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const walletAddress = await signer.getAddress();

            // Step 1.5: Check for ID NFT ownership (CA1 requirement)
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking ID NFT ownership...';
            
            // Initialize IDNFT service if not already done
            if (!window.idnftService) {
                console.error('IDNFT service not found');
                throw new Error('ID NFT service not loaded. Please refresh the page.');
            }
            
            try {
                await window.idnftService.ensureInitialized();
            } catch (error) {
                console.error('Failed to initialize ID NFT service:', error);
                throw new Error('Failed to connect to ID NFT contract. Please check your network connection.');
            }

            // Check if user has an active ID NFT
            try {
                const idnftStatus = await window.idnftService.checkUserIDNFT(walletAddress);
                
                if (!idnftStatus.hasActive) {
                    // User doesn't have an active ID NFT - redirect to registration
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    
                    const userResponse = confirm(
                        'You need to create a Bar Identity NFT before you can mint recipe NFTs.\n\n' +
                        'An ID NFT represents your bar identity and is required for all recipe creations.\n\n' +
                        'Would you like to create your ID NFT now?'
                    );
                    
                    if (userResponse) {
                        // Show the ID NFT creation modal
                        if (typeof window.idnftModal !== 'undefined') {
                            window.idnftModal.openModal();
                        } else {
                            // Fallback: redirect to dedicated IDNFT creation page
                            const currentPath = window.location.pathname;
                            let idnftPagePath;
                            
                            if (currentPath.includes('/pages/')) {
                                idnftPagePath = 'create-idnft.html';
                            } else {
                                idnftPagePath = 'pages/create-idnft.html';
                            }
                            
                            console.log('IDNFT modal not available, redirecting to:', idnftPagePath);
                            window.location.href = idnftPagePath;
                        }
                    }
                    return; // Stop form submission
                }
                
                console.log('User has active ID NFT with token ID:', idnftStatus.tokenId);
            } catch (error) {
                console.error('Error checking ID NFT status:', error);
                throw new Error('Failed to verify ID NFT ownership. Please try again.');
            }

            // Step 2: Collect form data once
            const ingredients = Array.from(document.querySelectorAll('input[name="ingredients[]"]'))
                .map(input => input.value.trim())
                .filter(value => value);

            const instructions = Array.from(document.querySelectorAll('input[name="instructions[]"]'))
                .map(input => input.value.trim())
                .filter(value => value);
            
            // Step 3: Upload image to IPFS
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading image to IPFS...';
            const imageFile = document.getElementById('cocktail-image').files[0];
            if (!imageFile) {
                throw new Error('No image file selected');
            }
            
            // Prepare metadata for IPFS upload
            const uploadMetadata = {
                cocktail_name: formData.get('name'),
                cocktail_intro: formData.get('description'),
                cocktail_recipe: JSON.stringify({
                    ingredients: ingredients,
                    instructions: instructions,
                    category: formData.get('category')
                })
            };
            
            const uploadResult = await apiService.uploadToIPFS(imageFile, uploadMetadata);
            console.log('Upload result:', uploadResult);
            
            // The backend returns the final metadata CID
            const finalCID = uploadResult.final_cid || uploadResult.cid || uploadResult;
            const metadataURI = `ipfs://${finalCID}`;

            // Step 5: Mint the NFT
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Minting NFT...';
            const contractAddress = APP_CONFIG.blockchain.recipeNft.address;
            const contractABI = APP_CONFIG.blockchain.recipeNft.abi;
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            // Call mintRecipeNFT which returns the token ID directly
            const transaction = await contract.mintRecipeNFT(metadataURI);
            const receipt = await transaction.wait();
            
            // Extract token ID from the transaction receipt events (more reliable method)
            let tokenId = null;
            if (receipt.events) {
                // Look for Transfer event which should contain the token ID
                const transferEvent = receipt.events.find(event => 
                    event.event === 'Transfer' && event.args && event.args.tokenId
                );
                if (transferEvent) {
                    tokenId = transferEvent.args.tokenId.toString();
                    console.log('Successfully minted NFT with Token ID:', tokenId);
                } else {
                    // Fallback: look for RecipeNFTCreated event
                    const createdEvent = receipt.events.find(event => 
                        event.event === 'RecipeNFTCreated' && event.args && event.args.tokenId
                    );
                    if (createdEvent) {
                        tokenId = createdEvent.args.tokenId.toString();
                        console.log('Successfully minted NFT with Token ID (from RecipeNFTCreated):', tokenId);
                    }
                }
            }
            
            if (!tokenId) {
                console.warn('Could not extract token ID from transaction receipt. Transaction hash:', transaction.hash);
                // In this case, we'll still have the transaction hash for backend storage
            } else {
                console.log(`NFT successfully minted! Token ID: ${tokenId}, Transaction: ${transaction.hash}`);
            }
            
            // Step 6: Get the ERC-6551 account address (the actual owner of the NFT)
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting ERC-4907 address...';
            
            let erc4907Address = null;
            if (tokenId) {
                try {
                    // Get the recipe metadata to extract the ERC-6551 account address
                    const metadata = await contract.getRecipeMetadata(tokenId);
                    erc4907Address = metadata.idNFTAccount; // This is the ERC-6551 account address
                    console.log('ERC-4907 address (ERC-6551 account):', erc4907Address);
                } catch (error) {
                    console.warn('Could not get ERC-6551 account address:', error);
                    // Fallback to token ID if we can't get the account address
                    erc4907Address = tokenId;
                }
            }
            
            // Step 7: Store recipe in backend
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Finalizing...';
            
            // The storeRecipe function expects 4 individual parameters
            // Backend expects: recipe_address: str (ERC-6551 account), metadata_cid: str, owner_address: str, price: float
            const priceValue = parseFloat(formData.get('price') || '0');
            
            const success = await apiService.storeRecipe(
                erc4907Address || tokenId || transaction.hash,  // recipeAddress (ERC-6551 account address)
                finalCID,         // metadataCid (string)
                walletAddress,    // ownerAddress (string - the user who initiated minting)
                priceValue        // price (float/number)
            );

            if (success) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Show success message with token ID if available
                const successMessage = tokenId 
                    ? `NFT created successfully! Token ID: ${tokenId}. Redirecting to marketplace...`
                    : 'NFT created successfully! Redirecting to marketplace...';
                    
                showNotification(successMessage, 'success');
                
                // Also log for debugging
                if (tokenId) {
                    console.log('=== NFT CREATION SUCCESS ===');
                    console.log('Token ID:', tokenId);
                    console.log('Transaction Hash:', transaction.hash);
                    console.log('Contract Address:', contractAddress);
                    console.log('Metadata URI:', metadataURI);
                    console.log('Owner Address:', walletAddress);
                    console.log('========================');
                }
                
                setTimeout(() => {
                    window.location.href = 'marketplace.html';
                }, 3000);
            } else {
                throw new Error('Failed to store recipe in backend');
            }

        } catch (error) {
            console.error('Failed to create NFT:', error);
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;

            // Show error message
            showNotification(`Failed to create NFT: ${error.message}`, 'error');
        }
    }

    // Preview NFT functionality
    window.previewNFT = function() {
        const form = document.getElementById('create-form');
        const formData = new FormData(form);

        // Get form values
        const name = formData.get('name') || 'Cocktail Name';
        const description = formData.get('description') || 'Description will appear here...';
        const category = formData.get('category') || 'Category';
        const price = formData.get('price') || '0.00';
        const royalties = formData.get('royalties') || '10';

        // Get ingredients and instructions
        const ingredients = Array.from(document.querySelectorAll('input[name="ingredients[]"]'))
            .map(input => input.value)
            .filter(value => value.trim());

        const instructions = Array.from(document.querySelectorAll('input[name="instructions[]"]'))
            .map(input => input.value)
            .filter(value => value.trim());

        // Get image preview
        const imageInput = document.getElementById('cocktail-image');
        let imageSrc = 'https://static.paraflowcontent.com/public/resource/image/313ff143-3da0-4108-b181-bbddce950b8f.jpeg'; // Default image
        
        if (imageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageSrc = e.target.result;
                showPreviewModal(name, description, category, price, royalties, ingredients, instructions, imageSrc);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            showPreviewModal(name, description, category, price, royalties, ingredients, instructions, imageSrc);
        }
    };

    // Show preview modal
    function showPreviewModal(name, description, category, price, royalties, ingredients, instructions, imageSrc) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content" style="max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>NFT Preview</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div>
                            <img src="${imageSrc}" alt="${name}" style="width: 100%; border-radius: 10px; margin-bottom: 1rem;">
                            <h3>${name}</h3>
                            <p style="color: #9ca3af; margin-bottom: 1rem;">${description}</p>
                            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                                <span style="background: rgba(37, 242, 242, 0.2); color: #25f2f2; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.875rem;">${category}</span>
                                <span style="background: rgba(37, 242, 242, 0.2); color: #25f2f2; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.875rem;">${price} USDT</span>
                            </div>
                        </div>
                        <div>
                            <h4 style="color: #25f2f2; margin-bottom: 1rem;">Recipe Details</h4>
                            <div style="margin-bottom: 2rem;">
                                <h5 style="color: #f9fafb; margin-bottom: 0.5rem;">Ingredients:</h5>
                                <ul style="color: #9ca3af; padding-left: 1rem;">
                                    ${ingredients.map(ingredient => `<li>${ingredient}</li>`).join('')}
                                </ul>
                            </div>
                            <div style="margin-bottom: 2rem;">
                                <h5 style="color: #f9fafb; margin-bottom: 0.5rem;">Instructions:</h5>
                                <ol style="color: #9ca3af; padding-left: 1rem;">
                                    ${instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                                </ol>
                            </div>
                            <div>
                                <p style="color: #9ca3af;"><strong>Royalties:</strong> ${royalties}%</p>
                            </div>
                        </div>
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
            `;
            document.head.appendChild(style);
        }
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
    initCreateForm();
}); 