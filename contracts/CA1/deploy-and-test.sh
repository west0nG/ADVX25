#!/bin/bash

echo "🚀 ERC-6551 ID NFT 一键部署和测试脚本"
echo "=========================================="

# 检查环境文件
if [ ! -f ".env" ]; then
    echo "❌ 错误: 未找到 .env 文件"
    echo "请先运行: cp env.example .env"
    echo "然后配置你的私钥和API密钥"
    exit 1
fi

# 检查是否配置了私钥
if ! grep -q "ADMIN_PRIVATE_KEY=" .env; then
    echo "❌ 错误: 请在 .env 文件中配置 ADMIN_PRIVATE_KEY"
    exit 1
fi

# 检查是否配置了Sepolia RPC URL
if ! grep -q "SEPOLIA_URL=" .env; then
    echo "❌ 错误: 请在 .env 文件中配置 SEPOLIA_URL"
    exit 1
fi

echo "✅ 环境配置检查通过"

# 编译合约
echo ""
echo "🔨 编译智能合约..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ 编译失败"
    exit 1
fi

echo "✅ 编译成功"

# 询问用户选择部署哪个合约
echo ""
echo "📋 请选择要部署的合约:"
echo "1) IDNFT6551Simple (简化版，推荐用于测试)"
echo "2) IDNFT6551 (完整版，需要ERC-6551 Registry)"
read -p "请输入选择 (1 或 2): " choice

case $choice in
    1)
        echo "🚀 部署简化版合约..."
        npx hardhat run scripts/deploy-simple.js --network sepolia
        ;;
    2)
        echo "🚀 部署完整版合约..."
        npx hardhat run scripts/deploy-6551.js --network sepolia
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

if [ $? -ne 0 ]; then
    echo "❌ 部署失败"
    exit 1
fi

echo ""
echo "✅ 合约部署成功!"
echo ""

# 询问是否启动前端
read -p "是否启动前端进行测试? (y/n): " start_frontend

if [ "$start_frontend" = "y" ] || [ "$start_frontend" = "Y" ]; then
    echo ""
    echo "🌐 启动前端服务器..."
    cd ../../test-deployment/frontend
    ./start.sh
else
    echo ""
    echo "📝 手动启动前端:"
    echo "cd ../../test-deployment/frontend"
    echo "./start.sh"
    echo ""
    echo "然后访问: http://localhost:8000/idnft-mint.html"
fi

echo ""
echo "🎉 部署和测试流程完成!"
echo ""
echo "📋 下一步操作:"
echo "1. 确保MetaMask已安装并切换到Sepolia测试网"
echo "2. 确保钱包有足够的Sepolia测试ETH"
echo "3. 访问前端界面进行测试"
echo "4. 在Etherscan查看合约详情" 