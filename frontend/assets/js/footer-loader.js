/**
 * Footer Loader - Consistent footer loading across all pages
 * Ensures identical footer experience on every page
 */

class FooterLoader {
    constructor() {
        this.isLoaded = false;
        this.basePath = this.detectBasePath();
        this.init();
    }

    init() {
        // Auto-load footer when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadFooter());
        } else {
            this.loadFooter();
        }
    }

    detectBasePath() {
        // Detect if we're in a subdirectory by checking script paths
        const scripts = document.querySelectorAll('script[src]');
        for (let script of scripts) {
            if (script.src.includes('../assets/')) {
                return '../'; // We're in a subdirectory like pages/
            }
        }
        return './'; // We're in the root directory
    }

    async loadFooter() {
        try {
            // Find or create footer container
            let footerContainer = document.getElementById('footer-container');
            
            if (!footerContainer) {
                // Remove any existing footer
                const existingFooter = document.querySelector('footer.footer');
                if (existingFooter) {
                    existingFooter.remove();
                }
                
                // Create footer container
                footerContainer = document.createElement('div');
                footerContainer.id = 'footer-container';
                document.body.appendChild(footerContainer);
            }

            // Clear any existing content
            footerContainer.innerHTML = '';

            // Determine footer component path
            const footerPath = this.basePath + 'components/footer.html';
            
            // Fetch footer component
            const response = await fetch(footerPath);
            if (!response.ok) {
                throw new Error(`Failed to load footer from ${footerPath}: ${response.statusText}`);
            }
            
            const footerHTML = await response.text();
            footerContainer.innerHTML = footerHTML;
            
            // Set up navigation links with correct paths
            this.setupNavigation(footerContainer);
            
            this.isLoaded = true;
            
            // Dispatch loaded event
            document.dispatchEvent(new CustomEvent('footerLoaded', {
                detail: { container: footerContainer, basePath: this.basePath }
            }));
            
        } catch (error) {
            console.error('Footer loading failed:', error);
            this.createCompleteFooter();
        }
    }

    setupNavigation(container) {
        // Handle internal page navigation
        const pageLinks = container.querySelectorAll('a[data-page]');
        pageLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            let href = '';
            
            if (page === 'home' || page === 'index') {
                href = this.basePath + 'index.html';
            } else {
                href = this.basePath + 'pages/' + page + '.html';
            }
            
            link.href = href;
            link.removeAttribute('data-page');
        });

        // Handle external links (keep as placeholder for now)
        const externalLinks = container.querySelectorAll('a[data-external]');
        externalLinks.forEach(link => {
            const external = link.getAttribute('data-external');
            link.href = '#'; // Keep as placeholder
            link.onclick = (e) => {
                e.preventDefault();
                console.log(`${external} page would open here`);
                // You can add actual external URL handling here later
            };
            link.removeAttribute('data-external');
        });
    }

    createCompleteFooter() {
        const footerContainer = document.getElementById('footer-container') || 
                              (() => {
                                  const container = document.createElement('div');
                                  container.id = 'footer-container';
                                  document.body.appendChild(container);
                                  return container;
                              })();

        // Create complete fallback footer with all elements
        footerContainer.innerHTML = `
            <footer class="footer">
                <div class="footer-container">
                    <!-- Main Footer Content -->
                    <div class="footer-main">
                        <!-- Brand Section -->
                        <div class="footer-brand">
                            <div class="footer-logo">
                                <i class="fas fa-martini-glass-citrus"></i>
                                <span>BarsHelpBars</span>
                            </div>
                            <p class="footer-description">
                                The premier marketplace for cocktail recipe NFTs. Discover, trade, and mint unique cocktail recipes from the world's best bartenders.
                            </p>
                            <div class="footer-social">
                                <a href="#" class="social-link" aria-label="Twitter">
                                    <i class="fab fa-twitter"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="Instagram">
                                    <i class="fab fa-instagram"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="Discord">
                                    <i class="fab fa-discord"></i>
                                </a>
                                <a href="#" class="social-link" aria-label="Telegram">
                                    <i class="fab fa-telegram-plane"></i>
                                </a>
                            </div>
                        </div>

                        <!-- Quick Links -->
                        <div class="footer-section">
                            <h4 class="footer-title">Marketplace</h4>
                            <ul class="footer-links">
                                <li><a href="${this.basePath}pages/marketplace.html">Browse Recipes</a></li>
                                <li><a href="${this.basePath}pages/create.html">Create NFT</a></li>
                                <li><a href="${this.basePath}pages/profile.html">My Collection</a></li>
                                <li><a href="${this.basePath}pages/main.html">Dashboard</a></li>
                            </ul>
                        </div>

                        <!-- Community -->
                        <div class="footer-section">
                            <h4 class="footer-title">Community</h4>
                            <ul class="footer-links">
                                <li><a href="#" onclick="console.log('About page would open here')">About Us</a></li>
                                <li><a href="#" onclick="console.log('Blog would open here')">Blog</a></li>
                                <li><a href="#" onclick="console.log('Events would open here')">Events</a></li>
                                <li><a href="#" onclick="console.log('Partnerships would open here')">Partnerships</a></li>
                            </ul>
                        </div>

                        <!-- Support -->
                        <div class="footer-section">
                            <h4 class="footer-title">Support</h4>
                            <ul class="footer-links">
                                <li><a href="#" onclick="console.log('Help center would open here')">Help Center</a></li>
                                <li><a href="#" onclick="console.log('Contact would open here')">Contact Us</a></li>
                                <li><a href="#" onclick="console.log('Terms would open here')">Terms of Service</a></li>
                                <li><a href="#" onclick="console.log('Privacy would open here')">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Footer Bottom -->
                    <div class="footer-bottom">
                        <div class="footer-bottom-content">
                            <div class="footer-copyright">
                                <p>© 2024 BarsHelpBars. All rights reserved.</p>
                            </div>
                            <div class="footer-badges">
                                <span class="footer-badge">
                                    <i class="fas fa-shield-alt"></i>
                                    Secure Blockchain
                                </span>
                                <span class="footer-badge">
                                    <i class="fas fa-leaf"></i>
                                    Carbon Neutral
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Initialize footer loader
window.footerLoader = new FooterLoader(); 