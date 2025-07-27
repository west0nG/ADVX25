// Script to remove second bar photos from all bar cards
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checking for second bar images to remove...');
    
    function removeSecondBarImages() {
        // Get all bar cards (assuming they use the same .nft-card class)
        const barCards = document.querySelectorAll('#bars-grid .nft-card');
        let totalRemoved = 0;
        
        barCards.forEach((card, index) => {
            // Get all images within this card
            const images = card.querySelectorAll('img');
            
            if (images.length > 1) {
                console.log(`Bar card ${index + 1}: Found ${images.length} images, removing extras...`);
                
                // Keep only the first image, remove all others
                for (let i = 1; i < images.length; i++) {
                    images[i].remove();
                    totalRemoved++;
                    console.log(`Removed image ${i + 1} from bar card ${index + 1}`);
                }
            }
            
            // Also check for any background images that might be set via CSS
            const imageContainer = card.querySelector('.nft-image');
            if (imageContainer) {
                // Remove any background-image styles that might create a second image effect
                if (imageContainer.style.backgroundImage && imageContainer.style.backgroundImage !== 'none') {
                    imageContainer.style.backgroundImage = 'none';
                    console.log(`Removed background image from bar card ${index + 1}`);
                    totalRemoved++;
                }
            }
            
            // Check for any duplicate image elements that might have the same src
            const remainingImages = card.querySelectorAll('img');
            if (remainingImages.length > 1) {
                const seenSources = new Set();
                remainingImages.forEach((img, imgIndex) => {
                    if (imgIndex === 0) {
                        seenSources.add(img.src);
                    } else if (seenSources.has(img.src)) {
                        img.remove();
                        totalRemoved++;
                        console.log(`Removed duplicate image from bar card ${index + 1}`);
                    } else {
                        seenSources.add(img.src);
                    }
                });
            }
        });
        
        if (totalRemoved > 0) {
            console.log(`Successfully removed ${totalRemoved} extra bar images`);
        } else {
            console.log('No extra bar images found to remove');
        }
        
        return totalRemoved;
    }
    
    // Run immediately
    removeSecondBarImages();
    
    // Also run after a short delay in case images are added dynamically
    setTimeout(removeSecondBarImages, 1000);
    
    // Run periodically to catch any late-loading images
    setInterval(removeSecondBarImages, 5000);
    
    // Set up a MutationObserver to watch for dynamically added images
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        // Check if the added node is an image in a bar card
                        if (node.tagName === 'IMG' && node.closest('#bars-grid .nft-card')) {
                            console.log('Detected dynamically added image in bar card, checking...');
                            setTimeout(removeSecondBarImages, 100);
                        }
                        // Also check if it's a bar card that was added
                        else if (node.classList && node.classList.contains('nft-card') && node.closest('#bars-grid')) {
                            console.log('Detected new bar card added, checking for extra images...');
                            setTimeout(removeSecondBarImages, 100);
                        }
                    }
                });
            }
        });
    });
    
    // Start observing
    const barsGrid = document.getElementById('bars-grid');
    if (barsGrid) {
        observer.observe(barsGrid, {
            childList: true,
            subtree: true
        });
        console.log('Started observing bar grid for image changes');
    } else {
        console.warn('Bar grid element not found - script may not work correctly');
    }
    
    console.log('Second bar image removal script initialized and active');
});