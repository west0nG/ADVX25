#!/bin/bash

# SipNFT Frontend Start Script
# This script starts a local HTTP server for the SipNFT frontend

echo "🍸 Starting SipNFT Frontend Server..."
echo "======================================"

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    echo "✅ Using Python 3"
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "✅ Using Python"
    python -m http.server 8000
elif command -v python2 &> /dev/null; then
    echo "✅ Using Python 2"
    python2 -m SimpleHTTPServer 8000
else
    echo "❌ Python not found. Please install Python or use Node.js."
    echo ""
    echo "Alternative: Install Node.js and run:"
    echo "  npx http-server -p 8000"
    exit 1
fi 