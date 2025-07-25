@echo off
REM BarsHelpBars Frontend Hot Reload Start Script for Windows
REM This script starts a development server with hot reload functionality

echo 🍸 Starting BarsHelpBars Frontend with Hot Reload...
echo ==================================================

REM Check if Node.js is available
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js first.
    echo.
    echo Install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm found

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

REM Start the development server with hot reload
echo 🚀 Starting development server with hot reload...
echo 📍 Server will be available at: http://localhost:8000
echo 🔄 Hot reload is enabled - changes will automatically refresh the browser
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev 