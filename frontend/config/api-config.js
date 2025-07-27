// API Configuration for BarsHelpBars
// Update these URLs based on your deployment environment

const API_CONFIG = {
    // Development configuration
    development: {
        AI_API_BASE_URL: 'http://localhost:8000/api/ai',
        MAIN_API_BASE_URL: 'http://localhost:8000/api',
        ENVIRONMENT: 'development'
    },
    
    // Production configuration - update these for your deployment
    production: {
        AI_API_BASE_URL: 'https://api.barshelpbars.com/api/ai',  // Update with your backend subdomain
        MAIN_API_BASE_URL: 'https://api.barshelpbars.com/api',   // Update with your backend subdomain
        ENVIRONMENT: 'production'
    }
};

// Auto-detect environment or set manually
const CURRENT_ENVIRONMENT = (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.port
) ? 'development' : 'production';

// Export current configuration
const API_ENDPOINTS = API_CONFIG[CURRENT_ENVIRONMENT];

// Helper function to get AI API base URL
function getAIApiBaseUrl() {
    return API_ENDPOINTS.AI_API_BASE_URL;
}

// Helper function to get main API base URL
function getMainApiBaseUrl() {
    return API_ENDPOINTS.MAIN_API_BASE_URL;
}

// Console log for debugging
console.log(`API Configuration loaded for ${CURRENT_ENVIRONMENT}:`, API_ENDPOINTS); 