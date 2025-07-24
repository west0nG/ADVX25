// Loading screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1000);
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

// Three.js background animation
function initThreeJS() {
    const canvas = document.getElementById('hero-canvas');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    // Create floating particles
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 20;
        positions[i + 1] = (Math.random() - 0.5) * 20;
        positions[i + 2] = (Math.random() - 0.5) * 20;

        // Cyan color variations
        colors[i] = 0.1 + Math.random() * 0.3;     // R
        colors[i + 1] = 0.9 + Math.random() * 0.1; // G
        colors[i + 2] = 0.9 + Math.random() * 0.1; // B
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    scene.add(particleSystem);

    // Create floating cocktail glass shapes
    const glassGeometry = new THREE.ConeGeometry(0.2, 0.6, 8);
    const glassMaterial = new THREE.MeshBasicMaterial({
        color: 0x25f2f2,
        transparent: true,
        opacity: 0.3,
        wireframe: true
    });

    const glasses = [];
    for (let i = 0; i < 8; i++) {
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.set(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
        );
        glass.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        glasses.push(glass);
        scene.add(glass);
    }

    camera.position.z = 5;

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Rotate particles
        particleSystem.rotation.y += 0.001;
        particleSystem.rotation.x += 0.0005;

        // Animate glasses
        glasses.forEach((glass, index) => {
            glass.rotation.y += 0.01 + index * 0.001;
            glass.rotation.x += 0.005;
            glass.position.y += Math.sin(Date.now() * 0.001 + index) * 0.001;
        });

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize Three.js when page loads
initThreeJS();

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add click effects to NFT cards
document.querySelectorAll('.nft-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
        setTimeout(() => {
            this.style.transform = 'translateY(-10px)';
        }, 150);
    });
});

// Add click effects to category cards
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
        this.style.transform = 'scale(1.08)';
        setTimeout(() => {
            this.style.transform = 'scale(1.05)';
        }, 150);
    });
});

// Add floating animation to step cards on hover
document.querySelectorAll('.step').forEach(step => {
    step.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.step-icon');
        icon.style.animation = 'float 1s ease-in-out infinite';
    });
    
    step.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.step-icon');
        icon.style.animation = 'none';
    });
});

// Search functionality
const searchInput = document.querySelector('.search-box input');
searchInput.addEventListener('focus', function() {
    this.parentElement.style.transform = 'scale(1.05)';
});

searchInput.addEventListener('blur', function() {
    this.parentElement.style.transform = 'scale(1)';
});

// Connect wallet button animation
document.querySelector('.connect-btn').addEventListener('click', function(e) {
    e.preventDefault();
    
    // Create ripple effect
    const ripple = document.createElement('div');
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.transform = 'scale(0)';
    ripple.style.animation = 'ripple 0.6s linear';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.width = '20px';
    ripple.style.height = '20px';
    ripple.style.marginLeft = '-10px';
    ripple.style.marginTop = '-10px';
    
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
});

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.floating-icon');
    
    parallaxElements.forEach((element, index) => {
        const speed = 0.5 + (index * 0.1);
        element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Add typewriter effect to hero title
function typewriterEffect() {
    const title = document.querySelector('.hero h1');
    const text = title.textContent;
    title.textContent = '';
    title.style.borderRight = '2px solid #25f2f2';
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
            setTimeout(() => {
                title.style.borderRight = 'none';
            }, 1000);
        }
    }, 50);
}

// Start typewriter effect after loading
setTimeout(typewriterEffect, 1500);

// Add mouse movement parallax
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    document.querySelectorAll('.floating-icon').forEach((icon, index) => {
        const speed = (index + 1) * 0.5;
        const x = (mouseX - 0.5) * speed * 20;
        const y = (mouseY - 0.5) * speed * 20;
        
        icon.style.transform += ` translate(${x}px, ${y}px)`;
    });
});

// Add pulse animation to CTA buttons
setInterval(() => {
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(button => {
        button.style.boxShadow = '0 0 30px rgba(37, 242, 242, 0.6)';
        setTimeout(() => {
            button.style.boxShadow = '';
        }, 1000);
    });
}, 3000);

// Dynamic background color shift
let hue = 0;
setInterval(() => {
    hue += 0.5;
    document.body.style.background = `linear-gradient(135deg, hsl(${hue}, 80%, 5%), hsl(${hue + 60}, 60%, 8%))`;
}, 100);

console.log('🍸 SipNFT Dynamic Landing Page Loaded Successfully!');