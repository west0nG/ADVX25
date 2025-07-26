#!/bin/bash

# Injective 测试网一键部署脚本 - CA2 RecipeNFT
# 使用方法: ./deploy-injective.sh

set -e

echo "🚀 Bars Help Bars CA2 - Injective 测试网部署脚本"
echo "================================================"

# 检查Node.js和npm
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到 npm，请先安装 npm"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ npm 版本: $(npm --version)"

# 检查.env文件
if [ ! -f .env ]; then
    echo "⚠️  警告: 未找到 .env 文件"
    echo "📝 正在创建 .env 文件..."
    cp env.example .env
    echo "✅ .env 文件已创建"
    echo "⚠️  请编辑 .env 文件，添加你的私钥和配置"
    echo "   特别是 PRIVATE_KEY 和 INJECTIVE_TESTNET_URL 字段"
    exit 1
fi

# 检查私钥配置
if ! grep -q "PRIVATE_KEY" .env || grep -q "PRIVATE_KEY=" .env && ! grep -q "PRIVATE_KEY=0x" .env; then
    echo "❌ 错误: 请在 .env 文件中配置 PRIVATE_KEY"
    echo "   格式: PRIVATE_KEY=0x你的私钥"
    exit 1
fi

# 检查RPC URL配置
if ! grep -q "INJECTIVE_TESTNET_URL" .env; then
    echo "❌ 错误: 请在 .env 文件中配置 INJECTIVE_TESTNET_URL"
    echo "   格式: INJECTIVE_TESTNET_URL=https://your-rpc-url"
    exit 1
fi

echo "✅ 环境配置检查通过"

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

# 编译合约
echo ""
echo "🔨 编译智能合约..."
npm run compile

# 检查编译结果
if [ ! -d "artifacts" ]; then
    echo "❌ 错误: 编译失败，未找到 artifacts 目录"
    exit 1
fi

echo "✅ 合约编译成功"

# 部署到Injective测试网
echo ""
echo "🚀 开始部署到 Injective 测试网..."
echo "⚠️  请确保你的账户有足够的测试网 INJ 代币"
echo "   可以从这里获取: https://testnet.faucet.injective.network/"

# 询问用户是否继续
read -p "是否继续部署? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 部署已取消"
    exit 1
fi

echo ""
echo "⏳ 正在部署..."
npm run deploy:injective

echo ""
echo "🎉 部署完成！"
echo "================================================"
echo "📋 部署信息已保存到 deployment-info.json"
echo "🌐 你可以在区块浏览器查看合约:"
echo "   https://testnet.explorer.injective.network/"
echo ""
echo "🔗 相关链接:"
echo "   - Injective 测试网水龙头: https://testnet.faucet.injective.network/"
echo "   - Injective 文档: https://docs.injective.network/"
echo "================================================" 