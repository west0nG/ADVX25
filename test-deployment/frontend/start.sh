#!/bin/bash

echo "🚀 启动 ID NFT 前端服务器..."
echo "📁 当前目录: $(pwd)"
echo "🌐 服务器将在 http://localhost:8000 启动"
echo "📱 请在浏览器中打开上述地址"
echo ""

# 检查Python版本
if command -v python3 &> /dev/null; then
    echo "🐍 使用 Python 3 启动服务器..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "🐍 使用 Python 启动服务器..."
    python -m http.server 8000
else
    echo "❌ 未找到 Python，请安装 Python 或使用其他 HTTP 服务器"
    echo "💡 你也可以使用 Node.js: npx http-server -p 8000"
    exit 1
fi 