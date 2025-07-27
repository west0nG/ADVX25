#!/bin/bash

# Deployment startup script for BarsHelpBars Backend

echo "🚀 Starting BarsHelpBars Backend..."

# Check if we're in the right directory
if [ ! -f "app/main.py" ]; then
    echo "❌ Error: app/main.py not found. Make sure you're in the backend directory."
    exit 1
fi

# Install dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    echo "📦 Installing dependencies..."
    pip install --no-cache-dir -r requirements.txt
fi

# Set default port if not provided
PORT=${PORT:-8000}

# Set default host
HOST=${HOST:-0.0.0.0}

# Set number of workers (defaults to 1 for better compatibility)
WORKERS=${WORKERS:-1}

echo "🌐 Starting server on $HOST:$PORT with $WORKERS workers..."

# Start the application
exec uvicorn app.main:app --host $HOST --port $PORT --workers $WORKERS 