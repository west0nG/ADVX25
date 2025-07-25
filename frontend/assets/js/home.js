

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Enhanced scroll animations with staggered effects
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Add staggered animation for grid items
            const grid = entry.target.querySelector('.nft-grid, .category-grid, .steps-grid');
            if (grid) {
                grid.classList.add('visible');
            }
            
            // Animate section titles
            const title = entry.target.querySelector('.section-title');
            if (title) {
                setTimeout(() => {
                    title.classList.add('visible');
                }, 200);
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Parallax scroll effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    const floatingElements = document.querySelectorAll('.floating-icon');
    
    if (hero && heroContent) {
        // Parallax effect for hero content
        heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
        // Completely fade out the hero content when scrolled down
        heroContent.style.opacity = Math.max(0, 1 - scrolled * 0.003);
    }
    
    // Enhanced parallax for floating elements
    floatingElements.forEach((element, index) => {
        const speed = 0.3 + (index * 0.1);
        const yPos = scrolled * speed;
        const xPos = Math.sin(scrolled * 0.001 + index) * 20;
        element.style.transform = `translateY(${yPos}px) translateX(${xPos}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Smooth section visibility without flashing animations
const sections = document.querySelectorAll('.section');

// Add CSS animation for ripple effects only
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Simple hero animation for minimal design
function initHeroAnimation() {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }
}

// Initialize hero animation when page loads
initHeroAnimation();

// Enhanced smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced click effects with ripple animation
document.querySelectorAll('.nft-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('div');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.position = 'absolute';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.background = 'rgba(16, 185, 129, 0.3)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        // Enhanced transform effect
        this.style.transform = 'translateY(-15px) scale(1.03)';
        setTimeout(() => {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        }, 200);
    });
});

// Enhanced category card effects
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('div');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.position = 'absolute';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.background = 'rgba(16, 185, 129, 0.3)';
        ripple.style.borderRadius = '50%';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
        
        this.style.transform = 'scale(1.1)';
        setTimeout(() => {
            this.style.transform = 'scale(1.05)';
        }, 200);
    });
});

// Enhanced step cards with advanced hover effects
document.querySelectorAll('.step').forEach((step, index) => {
    // Create floating particles effect
    const createParticles = () => {
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: linear-gradient(45deg, #10b981, #059669);
                border-radius: 50%;
                pointer-events: none;
                z-index: 1;
                opacity: 0;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            `;
            step.appendChild(particle);
            
            // Animate particle
            const angle = (i / 6) * Math.PI * 2;
            const distance = 60 + Math.random() * 40;
            const duration = 1000 + Math.random() * 500;
            
            particle.animate([
                { 
                    opacity: 0, 
                    transform: `translate(-50%, -50%) scale(0)` 
                },
                { 
                    opacity: 1, 
                    transform: `translate(${Math.cos(angle) * distance - 50}%, ${Math.sin(angle) * distance - 50}%) scale(1)` 
                },
                { 
                    opacity: 0, 
                    transform: `translate(${Math.cos(angle) * distance * 1.5 - 50}%, ${Math.sin(angle) * distance * 1.5 - 50}%) scale(0)` 
                }
            ], {
                duration: duration,
                easing: 'ease-out'
            }).addEventListener('finish', () => particle.remove());
        }
    };
    
    step.addEventListener('mouseenter', function() {
        createParticles();
        
        // Add ripple effect
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            background: rgba(16, 185, 129, 0.1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 0;
        `;
        this.appendChild(ripple);
        
        ripple.animate([
            { width: '0px', height: '0px', opacity: 0.8 },
            { width: '400px', height: '400px', opacity: 0 }
        ], {
            duration: 800,
            easing: 'ease-out'
        }).addEventListener('finish', () => ripple.remove());
    });
    
    // Add staggered entrance animation
    step.style.animationDelay = `${index * 0.2}s`;
});

// Enhanced search functionality
const searchInput = document.querySelector('.search-box input');
searchInput.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.05)';
                this.parentElement.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.4)';
});

searchInput.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
    this.parentElement.style.boxShadow = 'none';
});

// Enhanced connect wallet button animation
document.querySelector('.connect-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Create enhanced ripple effect
    const ripple = document.createElement('div');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.position = 'absolute';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.background = 'rgba(255, 255, 255, 0.4)';
    ripple.style.borderRadius = '50%';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.8s linear';
    ripple.style.pointerEvents = 'none';
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 800);
    
    // Enhanced button animation
    this.style.transform = 'translateY(-3px) scale(1.05)';
    setTimeout(() => {
        this.style.transform = 'translateY(-2px) scale(1.02)';
    }, 200);
});

// Enhanced mouse movement parallax
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    document.querySelectorAll('.floating-icon').forEach((icon, index) => {
        const speed = (index + 1) * 0.3;
        const x = (mouseX - 0.5) * speed * 30;
        const y = (mouseY - 0.5) * speed * 30;
        
        icon.style.transform = `translate(${x}px, ${y}px) rotate(${mouseX * 10}deg)`;
    });
});

// Enhanced pulse animation to CTA buttons
setInterval(() => {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach((button, index) => {
        setTimeout(() => {
            button.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.8)';
            button.style.transform = 'translateY(-2px) scale(1.02)';
            setTimeout(() => {
                button.style.boxShadow = '';
                button.style.transform = '';
            }, 1000);
        }, index * 200);
    });
}, 4000);

// Add typewriter effect to hero title
function typewriterEffect() {
    console.log('Typewriter effect function called');
    const title = document.querySelector('.hero h1');
    console.log('Title element found:', title);
    const originalText = "Sip, Own, Create: The Art of the Cocktail, On-Chain";
    console.log('Original text:', originalText);
    
    // Clear the title
    title.textContent = '';
    
    // Create a cursor span first
    const cursorSpan = document.createElement('span');
    cursorSpan.textContent = '|';
                cursorSpan.style.color = '#10b981'; // Cool green color
    cursorSpan.style.fontWeight = 'normal';
    cursorSpan.style.fontSize = '3.5rem';
    // No shadows, no effects - just a clean cursor
    // No animation initially - cursor stays solid during typing
    title.appendChild(cursorSpan);
    console.log('Cursor created and added to title');
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < originalText.length) {
            // Insert character before the cursor
            const char = document.createTextNode(originalText.charAt(i));
            title.insertBefore(char, cursorSpan);
            i++;
            console.log('Added character:', originalText.charAt(i-1));
        } else {
            // All text is complete, change to slower blink and keep flashing
            clearInterval(timer);
            console.log('Typewriter complete, cursor will flash slowly');
            cursorSpan.style.animation = 'blinkSlow 2s infinite'; // Slower blink
            setTimeout(() => {
                cursorSpan.remove();
                console.log('Cursor removed');
            }, 5000); // Keep flashing for 5 seconds
        }
    }, 80);
}

// Start typewriter effect after loading
console.log('Starting typewriter effect...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, setting up typewriter...');
    setTimeout(() => {
        console.log('Executing typewriter effect...');
        typewriterEffect();
    }, 1500);
});

// Clean JavaScript-based Continuously Rotating Carousel with Mouse Drag
class CircularCarousel {
    constructor(trackSelector) {
        this.track = document.querySelector(trackSelector);
        this.wrapper = this.track.parentElement;
        this.cards = Array.from(this.track.children);
        
        this.cardWidth = this.getCardWidth();
        this.currentPosition = 0;
        this.isManualControl = false;
        this.isPaused = false;
        this.animationId = null;
        
        // Drag state
        this.isDragging = false;
        this.startX = 0;
        this.startPosition = 0;
        this.dragVelocity = 0;
        this.lastDragTime = 0;
        this.lastDragX = 0;
        
        // Continuous rotation settings
        this.isCategory = this.track.classList.contains('category-carousel-track');
        this.rotationSpeed = this.isCategory ? 0.2 : 0.3; // pixels per frame
        
        this.init();
    }
    
    getCardWidth() {
        const isCategory = this.track.classList.contains('category-carousel-track');
        if (window.innerWidth <= 768) {
            return isCategory ? 300 : 320; 
        } else {
            return isCategory ? 320 : 340;
        }
    }
    
    init() {
        this.createInfiniteCards();
        this.setupEventListeners();
        this.startContinuousRotation();
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.cardWidth = this.getCardWidth();
            this.updatePosition();
        });
    }
    
    createInfiniteCards() {
        // Triple the cards for seamless infinite scroll
        const originalCards = [...this.cards];
        
        // Add copies at the end
        originalCards.forEach(card => {
            const clone1 = card.cloneNode(true);
            const clone2 = card.cloneNode(true);
            clone1.classList.add('clone');
            clone2.classList.add('clone');
            this.track.appendChild(clone1);
            this.track.appendChild(clone2);
        });
        
        // Start position in the middle set
        this.currentPosition = 0;
        this.totalWidth = this.cardWidth * originalCards.length;
        this.resetPosition = this.totalWidth;
    }
    
    setupEventListeners() {
        // Mouse drag events
        this.wrapper.addEventListener('mousedown', (e) => this.handleDragStart(e));
        document.addEventListener('mousemove', (e) => this.handleDragMove(e));
        document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
        
        // Touch drag events
        this.wrapper.addEventListener('touchstart', (e) => this.handleDragStart(e.touches[0]));
        document.addEventListener('touchmove', (e) => this.handleDragMove(e.touches[0]));
        document.addEventListener('touchend', (e) => this.handleDragEnd(e.changedTouches[0]));
        
        // Hover pause/resume
        this.wrapper.addEventListener('mouseenter', () => {
            if (!this.isDragging) {
                this.isPaused = true;
            }
        });
        
        this.wrapper.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.isPaused = false;
            }
        });
        
        // Prevent default drag behavior on images
        this.track.addEventListener('dragstart', (e) => e.preventDefault());
    }
    
    handleDragStart(e) {
        this.isDragging = true;
        this.isManualControl = true;
        this.isPaused = true;
        
        this.startX = e.clientX;
        this.startPosition = this.currentPosition;
        this.lastDragTime = Date.now();
        this.lastDragX = e.clientX;
        this.dragVelocity = 0;
        
        this.wrapper.classList.add('dragging');
        this.track.style.transition = 'none';
    }
    
    handleDragMove(e) {
        if (!this.isDragging) return;
        
        const currentX = e.clientX;
        const deltaX = currentX - this.startX;
        const currentTime = Date.now();
        
        // Calculate velocity for momentum
        if (currentTime - this.lastDragTime > 16) { // ~60fps
            this.dragVelocity = (currentX - this.lastDragX) / (currentTime - this.lastDragTime);
            this.lastDragTime = currentTime;
            this.lastDragX = currentX;
        }
        
        // Update position with drag
        this.currentPosition = this.startPosition - deltaX;
        this.updatePosition();
    }
    
    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.wrapper.classList.remove('dragging');
        
        // Apply momentum based on drag velocity
        const momentum = this.dragVelocity * 200; // Adjust multiplier for feel
        this.currentPosition += momentum;
        
        // Smooth transition back
        this.track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        this.updatePosition();
        
        // Resume auto-rotation after a delay
        setTimeout(() => {
            this.track.style.transition = '';
            this.isManualControl = false;
            this.isPaused = false;
        }, 600);
    }
    
         updatePosition() {
         this.track.style.transform = `translateX(${-this.currentPosition}px)`;
         
         // Reset position for infinite scroll
         if (this.currentPosition >= this.resetPosition * 2) {
             this.currentPosition = this.resetPosition;
         } else if (this.currentPosition < 0) {
             this.currentPosition = this.resetPosition - this.cardWidth;
         }
     }
     
     startContinuousRotation() {
         const animate = () => {
             if (!this.isPaused && !this.isManualControl) {
                 this.currentPosition += this.rotationSpeed;
                 this.updatePosition();
             }
             this.animationId = requestAnimationFrame(animate);
         };
         animate();
     }
     
     stopContinuousRotation() {
         if (this.animationId) {
             cancelAnimationFrame(this.animationId);
         }
     }
}

// Initialize carousels when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Featured NFTs Carousel
    const nftCarousel = new CircularCarousel('#carouselTrack');
    
    // Categories Carousel  
    const categoryCarousel = new CircularCarousel('#categoryCarouselTrack');
    
    // Carousels now use mouse drag controls instead of arrows
    // Smooth continuous rotation with intuitive drag interaction
    
    console.log('🍸 SipNFT Drag-Controlled Carousels Initialized!');
});

console.log('🍸 SipNFT Enhanced Dynamic Landing Page Loaded Successfully!');
console.log('🍸 SipNFT Circular Carousel Implemented!');