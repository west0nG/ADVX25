#!/bin/bash

echo "🍹 RecipeNFT ERC-4907 测试环境启动脚本"
echo "=========================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "✅ Node.js 和 npm 已安装"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 编译合约
echo "🔨 编译智能合约..."
npx hardhat compile

echo ""
echo "🎯 选择测试环境:"
echo "1. 本地Hardhat网络测试"
echo "2. Sepolia测试网测试"
echo "3. 启动前端测试页面"
echo "4. 运行单元测试"
echo "5. 退出"
echo ""

read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo "🚀 启动本地Hardhat网络..."
        npx hardhat node &
        HARDHAT_PID=$!
        echo "⏳ 等待网络启动..."
        sleep 3
        
        echo "📋 部署合约到本地网络..."
        npx hardhat run scripts/deploy.js --network localhost
        
        echo "🌐 启动前端测试页面..."
        echo "📱 请在浏览器中访问: http://localhost:8080/test-frontend.html"
        echo "💡 提示: 使用MetaMask连接本地网络 (http://localhost:8545)"
        
        # 启动HTTP服务器
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8080
        elif command -v python &> /dev/null; then
            python -m http.server 8080
        else
            echo "⚠️  未找到Python，请手动启动HTTP服务器"
            echo "💡 可以使用: npx http-server -p 8080"
        fi
        
        # 清理
        kill $HARDHAT_PID 2>/dev/null
        ;;
        
    2)
        echo "🌐 Sepolia测试网测试"
        echo "=========================================="
        echo "📋 前置要求:"
        echo "1. 确保已创建 .env 文件并配置以下内容:"
        echo "   PRIVATE_KEY=your_private_key_here"
        echo "   SEPOLIA_RPC_URL=your_sepolia_rpc_url"
        echo "   USDTERSCAN_API_KEY=your_etherscan_api_key"
        echo ""
        echo "2. 确保有Sepolia测试网USDT"
        echo "3. 确保MetaMask已切换到Sepolia网络"
        echo ""
        
        read -p "是否已准备好环境? (y/n): " ready
        
        if [ "$ready" = "y" ] || [ "$ready" = "Y" ]; then
            echo "🚀 部署合约到Sepolia测试网..."
            npx hardhat run scripts/deploy-sepolia.js --network sepolia
            
            echo ""
            echo "🌐 启动前端测试页面..."
            echo "📱 请在浏览器中访问: http://localhost:8080/test-frontend.html"
            echo "💡 提示: 确保MetaMask连接到Sepolia网络"
            
            # 启动HTTP服务器
            if command -v python3 &> /dev/null; then
                python3 -m http.server 8080
            elif command -v python &> /dev/null; then
                python -m http.server 8080
            else
                echo "⚠️  未找到Python，请手动启动HTTP服务器"
                echo "💡 可以使用: npx http-server -p 8080"
            fi
        else
            echo "❌ 请先准备好环境后再运行"
        fi
        ;;
        
    3)
        echo "🌐 启动前端测试页面..."
        echo "📱 请在浏览器中访问: http://localhost:8080/test-frontend.html"
        
        # 启动HTTP服务器
        if command -v python3 &> /dev/null; then
            python3 -m http.server 8080
        elif command -v python &> /dev/null; then
            python -m http.server 8080
        else
            echo "⚠️  未找到Python，请手动启动HTTP服务器"
            echo "💡 可以使用: npx http-server -p 8080"
        fi
        ;;
        
    4)
        echo "🧪 运行单元测试..."
        npm test
        ;;
        
    5)
        echo "👋 再见!"
        exit 0
        ;;
        
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac 