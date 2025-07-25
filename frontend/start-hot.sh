#!/bin/bash

# BarsHelpBars Frontend Hot Reload Start Script
# This script starts a development server with hot reload functionality

echo "🍸 Starting BarsHelpBars Frontend with Hot Reload..."
echo "=================================================="

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo ""
    echo "Install Node.js from: https://nodejs.org/"
    echo "Or use package manager:"
    echo "  macOS: brew install node"
    echo "  Ubuntu: sudo apt install nodejs npm"
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm found"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server with hot reload
echo "🚀 Starting development server with hot reload..."
echo "📍 Server will be available at: http://localhost:8000"
echo "🔄 Hot reload is enabled - changes will automatically refresh the browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev 