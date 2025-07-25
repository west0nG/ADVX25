#!/bin/bash

# 🚀 CA2 RecipeNFT 一键部署脚本 (简化版)
# 只需要配置私钥即可部署

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "🚀 CA2 RecipeNFT 一键部署脚本"
echo "================================"

# 检查是否在正确目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ 请在 CA2 目录下运行此脚本${NC}"
    exit 1
fi

# 检查环境文件
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  创建环境文件...${NC}"
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${GREEN}✅ 已创建 .env 文件${NC}"
        echo ""
        echo "请编辑 .env 文件，填入您的私钥："
        echo "PRIVATE_KEY=your_private_key_here"
        echo ""
        echo "配置完成后重新运行此脚本"
        exit 0
    else
        echo -e "${RED}❌ env.example 文件不存在${NC}"
        exit 1
    fi
fi

# 检查私钥配置
if grep -q "your_private_key_here" .env; then
    echo -e "${RED}❌ 请先在 .env 文件中配置您的私钥${NC}"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 编译合约
echo "🔨 编译合约..."
npx hardhat compile

# 部署合约
echo "🚀 部署 RecipeNFT 合约到 Sepolia 测试网..."
echo ""
echo "选择部署版本："
echo "1) 部署到 Sepolia 测试网 (推荐)"
echo "2) 部署到本地网络 (测试用)"
echo "3) 退出"
echo ""
read -p "请选择 (1-3): " choice

case $choice in
    1)
        echo "部署到 Sepolia 测试网..."
        npx hardhat run scripts/deploy-sepolia.js --network sepolia
        ;;
    2)
        echo "部署到本地网络..."
        npx hardhat run scripts/deploy.js --network localhost
        ;;
    3)
        echo "退出部署"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo ""
echo "下一步："
echo "1. 记录合约地址"
echo "2. 启动前端测试: ./start-test.sh"
echo "3. 访问: test-frontend.html" 