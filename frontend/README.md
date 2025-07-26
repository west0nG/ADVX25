# BarsHelpBars Frontend

A decentralized platform for cocktail recipes and bar management built on blockchain technology. This frontend application provides a seamless interface for creating, managing, and discovering cocktail recipes and bars through NFTs and IPFS integration.

## 🚀 Features

### 🍹 Recipe Management
- **Create & Mint Recipe NFTs**: Upload cocktail recipes with images to IPFS and mint them as NFTs
- **Browse Marketplace**: Discover and explore recipes from other creators
- **Search & Filter**: Find recipes by name, ingredients, or category
- **Recipe Details**: View detailed instructions, ingredients, and creator information

### 🏪 Bar Management
- **Create Bars**: Register cocktail bars on the blockchain with IPFS metadata
- **Manage Bar Information**: Update bar details, descriptions, and settings
- **Recipe Integration**: Link bars with owned and used recipes
- **Bar Discovery**: Explore bars and their signature cocktails

### 🔗 Blockchain Integration
- **Wallet Connection**: MetaMask and other Web3 wallet support
- **Multi-Network**: Support for Ethereum, Polygon, and testnets
- **Smart Contracts**: Recipe NFT minting and management
- **IPFS Storage**: Decentralized storage for images and metadata

### 🛠️ API Integration
- **Comprehensive Backend API**: Full integration with bars and recipes endpoints
- **Real-time Testing**: Built-in API testing interface
- **Error Handling**: Robust error handling with retry logic
- **Health Monitoring**: API health checks and status monitoring

## 📁 Project Structure

```
frontend/
├── assets/
│   ├── css/                 # Stylesheets
│   ├── js/                  # JavaScript modules
│   │   ├── api-service.js   # Main API service class
│   │   ├── api-examples.js  # API usage examples and workflows
│   │   ├── wallet-service.js # Web3 wallet integration
│   │   ├── auth-manager.js  # Authentication management
│   │   └── [page-scripts]   # Page-specific JavaScript
│   └── images/              # Static images
├── components/              # Reusable UI components
├── config/
│   └── app.config.js       # Application configuration
├── pages/
│   ├── bars.html           # Bar management interface
│   ├── marketplace.html    # Recipe marketplace
│   ├── create.html         # Recipe creation
│   ├── profile.html        # User profile
│   └── [other-pages]       # Additional pages
├── test-api.html           # Comprehensive API testing interface
├── index.html              # Landing page
└── API_INTEGRATION_GUIDE.md # Detailed API documentation
```

## 🔧 Setup & Installation

### Prerequisites
- Modern web browser with Web3 support
- Backend API server running (see backend documentation)
- MetaMask or compatible Web3 wallet

### Quick Start
1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ADVX25/frontend
   ```

2. **Configure the backend URL**
   Edit `config/app.config.js`:
   ```javascript
   api: {
       baseUrl: 'http://localhost:8080/api', // Your backend URL
       // ... other config
   }
   ```

3. **Start the development server**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Access the application**
   Open `http://localhost:8000` in your browser

## 🌐 API Integration

### Backend Endpoints

#### Bars API
- `POST /api/bars/upload_bar_ipfs` - Upload bar data to IPFS
- `GET /api/bars/get/{bar_address}` - Get bar information
- `POST /api/bars/update` - Update bar details
- `POST /api/bars/set` - Set new bar data
- `GET /api/bars/owned_recipes/{bar_address}` - Get owned recipes
- `GET /api/bars/used_recipes/{bar_address}` - Get used recipes

#### Recipes API
- `POST /api/recipes/upload_ipfs` - Upload recipe images to IPFS
- `POST /api/recipes/store_recipe/{recipe_address}/{metadata_cid}/{owner_address}/{price}` - Store recipe
- `GET /api/recipes/get_ten_recipes` - Get recent recipes
- `GET /api/recipes/get_all_recipes` - Get all recipes
- `POST /api/recipes/search_recipes` - Search recipes
- `GET /api/recipes/get_one_recipe/{nft_address}/{user_address}` - Get specific recipe

### API Service Usage

```javascript
// Basic usage examples
const recipes = await apiService.getAllRecipes();
const bar = await apiService.getBar(barAddress);
const cid = await apiService.uploadToIPFS(imageFile);

// Complete workflows
const recipeResult = await apiExamples.exampleCompleteRecipeWorkflow();
const barResult = await apiExamples.exampleCompleteBarWorkflow();

// List all available methods
apiExamples.listAvailableMethods();
```

## 🧪 Testing

### API Testing Interface
Access the comprehensive API testing interface at:
```
http://localhost:8000/test-api.html
```

Features:
- ✅ Test all bars and recipes endpoints
- ✅ Complete workflow testing
- ✅ Real-time API health monitoring
- ✅ Interactive form interfaces
- ✅ JSON response visualization
- ✅ Error handling demonstration

### Manual Testing
1. **Recipe Creation**
   - Navigate to Create page
   - Upload an image and fill recipe details
   - Test IPFS upload and recipe storage

2. **Bar Management**
   - Go to bars.html
   - Create a new bar
   - Test bar updating and recipe viewing

3. **Marketplace**
   - Browse existing recipes
   - Test search functionality
   - View recipe details

## 🔐 Wallet Integration

### Supported Wallets
- MetaMask
- WalletConnect-compatible wallets
- Other Web3-enabled browsers

### Network Configuration
Supported networks (configurable in app.config.js):
- Ethereum Mainnet
- Polygon
- Sepolia Testnet
- Goerli Testnet (deprecated)

### Authentication Flow
1. Connect wallet
2. Verify network
3. Sign authentication message
4. Maintain session state
5. Auto-reconnect on page reload

## 📚 Documentation

### Key Files
- **API_INTEGRATION_GUIDE.md**: Comprehensive API documentation
- **config/app.config.js**: Application configuration reference
- **assets/js/api-service.js**: API service implementation
- **assets/js/api-examples.js**: Usage examples and workflows

### Code Examples

#### Creating a Bar
```javascript
const barData = {
    name: "The Cocktail Lounge",
    address: "123 Main St, City",
    description: "A sophisticated cocktail bar",
    owner: "0x..."
};

const uploadResult = await apiService.uploadBarToIPFS(barData);
const setResult = await apiService.setBar(barData);
```

#### Recipe Management
```javascript
// Upload image
const imageCid = await apiService.uploadToIPFS(imageFile);

// Store recipe
const result = await apiService.storeRecipe(
    recipeAddress, imageCid, ownerAddress, price
);

// Get recipes
const allRecipes = await apiService.getAllRecipes();
const searchResults = await apiService.searchRecipes("margarita");
```

## 🚨 Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Verify backend server is running
   - Check CORS configuration
   - Confirm API base URL in config

2. **Wallet Connection Issues**
   - Ensure MetaMask is installed
   - Check network configuration
   - Verify account permissions

3. **IPFS Upload Failures**
   - Check file size limits (10MB max)
   - Verify supported formats (JPG, PNG, WebP)
   - Confirm IPFS gateway accessibility

4. **Transaction Failures**
   - Check account balance
   - Verify network selection
   - Review gas settings

### Debug Mode
Enable debug logging:
```javascript
window.DEBUG_API = true; // API debugging
APP_CONFIG.auth.debug = true; // Auth debugging
```

### Health Checks
Monitor API status:
```javascript
const isHealthy = await apiService.checkHealth();
```

## 🔄 Development Workflow

### Adding New Features
1. Update API endpoints in `config/app.config.js`
2. Extend `api-service.js` with new methods
3. Add examples to `api-examples.js`
4. Update documentation
5. Test in `test-api.html`

### Code Style
- Use modern JavaScript (ES6+)
- Follow consistent naming conventions
- Add comprehensive error handling
- Include JSDoc comments for functions
- Test all API integrations

## 📱 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers with Web3 support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using test-api.html
5. Update documentation
6. Submit a pull request

## 📄 License

[Add your license information here]

## 🆘 Support

For technical support:
1. Check the API_INTEGRATION_GUIDE.md
2. Use the test-api.html interface for debugging
3. Review browser console for errors
4. Check backend server logs
5. Open an issue with detailed error information

---

**Built with ❤️ for the cocktail community** 