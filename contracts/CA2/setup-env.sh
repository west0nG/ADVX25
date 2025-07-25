#!/bin/bash

echo "🔧 RecipeNFT ERC-4907 环境配置助手"
echo "=================================="

# 检查是否已存在.env文件
if [ -f ".env" ]; then
    echo "⚠️  发现已存在的 .env 文件"
    read -p "是否要备份并重新配置? (y/n): " backup_choice
    
    if [ "$backup_choice" = "y" ] || [ "$backup_choice" = "Y" ]; then
        cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
        echo "✅ 已备份为 .env.backup.$(date +%Y%m%d_%H%M%S)"
    else
        echo "❌ 取消配置"
        exit 0
    fi
fi

echo ""
echo "📋 开始配置环境变量..."
echo ""

# 复制模板
cp env.example .env

echo "🔑 配置私钥..."
echo "💡 提示: 从MetaMask导出私钥 (账户 -> 三个点 -> 账户详情 -> 导出私钥)"
read -p "请输入你的钱包私钥 (0x开头): " private_key

if [[ $private_key == 0x* ]]; then
    sed -i.bak "s/PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef/PRIVATE_KEY=$private_key/" .env
    echo "✅ 私钥配置完成"
else
    echo "❌ 私钥格式错误，请确保以0x开头"
    exit 1
fi

echo ""
echo "🌐 配置网络RPC..."
echo "请选择RPC提供商:"
echo "1. Alchemy (推荐)"
echo "2. Infura"
echo "3. 自定义"
read -p "请选择 (1-3): " rpc_choice

case $rpc_choice in
    1)
        echo "🔗 配置Alchemy RPC"
        echo "💡 获取API Key: https://www.alchemy.com/"
        read -p "请输入Alchemy API Key: " alchemy_key
        sed -i.bak "s|SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY|SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/$alchemy_key|" .env
        sed -i.bak "s|GOERLI_RPC_URL=https://eth-goerli.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY|GOERLI_RPC_URL=https://eth-goerli.g.alchemy.com/v2/$alchemy_key|" .env
        echo "✅ Alchemy RPC配置完成"
        ;;
    2)
        echo "🔗 配置Infura RPC"
        echo "💡 获取API Key: https://infura.io/"
        read -p "请输入Infura API Key: " infura_key
        sed -i.bak "s|SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY|SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/$infura_key|" .env
        sed -i.bak "s|GOERLI_RPC_URL=https://eth-goerli.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY|GOERLI_RPC_URL=https://goerli.infura.io/v3/$infura_key|" .env
        echo "✅ Infura RPC配置完成"
        ;;
    3)
        echo "🔗 配置自定义RPC"
        read -p "请输入Sepolia RPC URL: " custom_sepolia
        read -p "请输入Goerli RPC URL: " custom_goerli
        sed -i.bak "s|SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY|SEPOLIA_RPC_URL=$custom_sepolia|" .env
        sed -i.bak "s|GOERLI_RPC_URL=https://eth-goerli.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY|GOERLI_RPC_URL=$custom_goerli|" .env
        echo "✅ 自定义RPC配置完成"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "🔍 配置Etherscan API Key (可选)..."
echo "💡 获取API Key: https://etherscan.io/apis"
echo "⚠️  注意: 这是可选的，如果不验证合约可以跳过"
read -p "请输入Etherscan API Key (可选，按回车跳过): " etherscan_key

if [ ! -z "$etherscan_key" ]; then
    sed -i.bak "s/ETHERSCAN_API_KEY=/ETHERSCAN_API_KEY=$etherscan_key/" .env
    echo "✅ Etherscan API Key配置完成"
else
    echo "✅ 跳过Etherscan API Key配置 (合约将不会在Etherscan上验证)"
fi

echo ""
echo "🎯 配置合约地址..."
echo "💡 这些地址将在部署后自动更新"
read -p "是否现在配置ID NFT合约地址? (y/n): " idnft_choice

if [ "$idnft_choice" = "y" ] || [ "$idnft_choice" = "Y" ]; then
    read -p "请输入ID NFT合约地址 (CA1): " idnft_address
    if [[ $idnft_address == 0x* ]]; then
        sed -i.bak "s/IDNFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000/IDNFT_CONTRACT_ADDRESS=$idnft_address/" .env
        echo "✅ ID NFT合约地址配置完成"
    else
        echo "❌ 地址格式错误，请确保以0x开头"
    fi
fi

# 清理备份文件
rm -f .env.bak

echo ""
echo "🎉 环境配置完成!"
echo ""
echo "📋 配置摘要:"
echo "✅ 私钥: 已配置"
echo "✅ Sepolia RPC: 已配置"
echo "✅ Goerli RPC: 已配置"
if [ ! -z "$etherscan_key" ]; then
    echo "✅ Etherscan API: 已配置 (合约将自动验证)"
else
    echo "✅ Etherscan API: 跳过 (合约不会验证，但不影响功能)"
fi
if [ "$idnft_choice" = "y" ] || [ "$idnft_choice" = "Y" ]; then
    echo "✅ ID NFT地址: 已配置"
else
    echo "⚠️  ID NFT地址: 未配置"
fi

echo ""
echo "🚀 下一步操作:"
echo "1. 确保有Sepolia测试网ETH"
echo "2. 运行: ./start-test.sh"
echo "3. 选择 '2. Sepolia测试网测试'"
echo "4. 开始部署和测试!"

echo ""
echo "📚 相关链接:"
echo "- Sepolia水龙头: https://sepoliafaucet.com/"
echo "- Alchemy: https://www.alchemy.com/"
echo "- Infura: https://infura.io/"
echo "- Etherscan: https://etherscan.io/apis" 