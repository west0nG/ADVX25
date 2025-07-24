@echo off
REM SipNFT Frontend Start Script for Windows
REM This script starts a local HTTP server for the SipNFT frontend

echo 🍸 Starting SipNFT Frontend Server...
echo ======================================

REM Check if Python 3 is available
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Using Python
    python -m http.server 8000
    goto :eof
)

REM Check if Python 3 is available
python3 --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Using Python 3
    python3 -m http.server 8000
    goto :eof
)

REM Check if Python 2 is available
python2 --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Using Python 2
    python2 -m SimpleHTTPServer 8000
    goto :eof
)

echo ❌ Python not found. Please install Python or use Node.js.
echo.
echo Alternative: Install Node.js and run:
echo   npx http-server -p 8000
pause 