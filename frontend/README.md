# SipNFT Frontend

A complete frontend for SipNFT - The Art of Cocktails, On-Chain. This is a marketplace for cocktail recipes as NFTs, built with the easiest stack: HTML, CSS, and JavaScript.

## 🚀 Features

- **Homepage**: Landing page with hero section, featured NFTs, categories, and how it works
- **Marketplace**: Browse, filter, and search cocktail NFTs with pagination
- **Create NFT**: Form to mint new cocktail recipe NFTs with image upload
- **Profile**: User profile with NFT collection, created NFTs, transaction history, and settings
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 📁 Project Structure

```
frontend/
├── index.html                    # Main homepage
├── assets/
│   ├── css/
│   │   └── main.css             # Main stylesheet
│   ├── js/
│   │   ├── home.js              # Homepage functionality
│   │   ├── marketplace.js       # Marketplace functionality
│   │   ├── create.js            # Create form functionality
│   │   └── profile.js           # Profile functionality
│   └── images/                  # Image assets (future use)
├── pages/
│   ├── marketplace.html         # NFT marketplace page
│   ├── create.html              # Create NFT page
│   └── profile.html             # User profile page
├── components/
│   ├── header.html              # Reusable header component
│   └── footer.html              # Reusable footer component
├── config/
│   └── app.config.js            # Application configuration
├── start.sh                     # Start script (macOS/Linux)
├── start.bat                    # Start script (Windows)
├── .gitignore                   # Git ignore rules
├── package.json                 # Project configuration
├── HOW_TO_RUN.md               # Detailed run instructions
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites
- **Python 3.x** or **Node.js** (for HTTP server)
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

### Quick Run (3 steps)

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Start the server:**
   ```bash
   # Option A: Use the start script (recommended)
   ./start.sh          # macOS/Linux
   start.bat           # Windows
   
   # Option B: Manual commands
   python -m http.server 8000    # Python 3
   python -m SimpleHTTPServer 8000  # Python 2
   npx http-server -p 8000       # Node.js
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:8000
   ```

### Alternative Methods

- **VS Code**: Install "Live Server" extension and right-click `index.html`
- **Direct opening**: Double-click `index.html` (limited functionality)

### 📖 Detailed Instructions

For comprehensive setup instructions, troubleshooting, and advanced usage, see **[HOW_TO_RUN.md](HOW_TO_RUN.md)**.

## 📄 Pages Overview

### 🏠 Homepage (index.html)
- Animated hero section with Three.js background
- Featured NFT showcase
- Category exploration
- How it works section

### 🛒 Marketplace (pages/marketplace.html)
- Filter by category and price range
- Search functionality
- Pagination
- NFT detail modals
- Sort options

### ✨ Create NFT (pages/create.html)
- Dynamic form with validation
- Image upload with drag & drop
- Dynamic ingredient and instruction fields
- NFT preview functionality
- Form validation and error handling

### 👤 Profile (pages/profile.html)
- Tabbed interface (My NFTs, Created, Transactions, Settings)
- NFT collection management
- Transaction history
- User settings
- Wallet connection status

## 🎨 Styling & Design

The frontend uses a modern, dark theme with:
- **Primary color**: Cyan (#25f2f2)
- **Secondary color**: Pink (#ec4899)
- **Dark background**: Deep blue (#0a0f1a)
- **Glassmorphism effects**
- **Smooth animations and transitions**
- **Responsive grid layouts**

## 🔧 Configuration

The application configuration is centralized in `config/app.config.js`:
- API settings
- Blockchain configuration
- UI theme settings
- Feature toggles
- Upload limits
- Pagination settings

## 🧩 Components

Reusable components are stored in the `components/` directory:
- **Header**: Navigation and search functionality
- **Footer**: Links and social media

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🔄 File Organization Benefits

### Before Restructuring:
```
frontend/
├── index.html
├── marketplace.html
├── create.html
├── profile.html
├── styles.css
├── script.js
├── marketplace.js
├── create.js
├── profile.js
└── README.md
```

### After Restructuring:
```
frontend/
├── index.html
├── assets/
│   ├── css/main.css
│   └── js/
│       ├── home.js
│       ├── marketplace.js
│       ├── create.js
│       └── profile.js
├── pages/
│   ├── marketplace.html
│   ├── create.html
│   └── profile.html
├── components/
│   ├── header.html
│   └── footer.html
├── config/
│   └── app.config.js
└── README.md
```

## ✨ Benefits of New Structure

1. **Better Organization**: Assets, pages, and components are clearly separated
2. **Scalability**: Easy to add new pages, components, and assets
3. **Maintainability**: Related files are grouped together
4. **Reusability**: Components can be easily reused across pages
5. **Configuration**: Centralized configuration for easy customization
6. **Future-Proof**: Structure supports future enhancements

## 🚀 Development Workflow

1. **Add new pages**: Create HTML files in `pages/`
2. **Add new styles**: Update `assets/css/main.css`
3. **Add new functionality**: Create JS files in `assets/js/`
4. **Add new components**: Create HTML files in `components/`
5. **Update configuration**: Modify `config/app.config.js`

## 📝 Notes

- This is a frontend-only implementation with mock data
- No backend integration is included
- All interactions are simulated for demonstration purposes
- Images are loaded from external URLs for demonstration
- The structure is optimized for easy maintenance and future development

## 🔧 Customization

You can easily customize the frontend by:
- Modifying colors in `assets/css/main.css`
- Adding new NFT data in the JavaScript files
- Updating images and content in the HTML files
- Adding new features to the JavaScript functionality
- Modifying configuration in `config/app.config.js` 