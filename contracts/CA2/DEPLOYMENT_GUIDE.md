# CA2 RecipeNFT 部署指南

## 📋 概述

本指南将帮助你在以太坊测试链（Sepolia/Goerli）上部署 RecipeNFT 智能合约。

## 🛠️ 前置要求

1. **Node.js** (版本 16 或更高)
2. **npm** 或 **yarn**
3. **MetaMask** 钱包
4. **测试网 USDT** (用于支付gas费)

## 🚀 部署步骤

### 1. 安装依赖

```bash
cd contracts/CA2
npm install
```

### 2. 配置环境变量

复制环境变量模板文件：
```bash
cp env.example .env
```

编辑 `.env` 文件，添加以下配置：
```env
# 私钥 (从MetaMask导出，注意安全)
PRIVATE_KEY=your_private_key_here

# Infura/Alchemy API密钥
INFURA_API_KEY=your_infura_api_key_here
# 或者使用 Alchemy
ALCHEMY_API_KEY=your_alchemy_api_key_here

# 测试网配置
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_API_KEY
```

### 3. 更新 Hardhat 配置

编辑 `hardhat.config.js` 文件：

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {},
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5
    }
  },
  etherscan: {
    apiKey: process.env.USDTERSCAN_API_KEY
  }
};
```

### 4. 编译合约

```bash
npm run compile
```

### 5. 部署到测试网

#### 部署到 Sepolia 测试网：
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

#### 部署到 Goerli 测试网：
```bash
npx hardhat run scripts/deploy.js --network goerli
```

### 6. 验证部署

部署成功后，你会看到类似以下的输出：
```
Deploying contracts with the account: 0x...
RecipeNFT deployed to: 0x...
```

记录下合约地址，后续测试会用到。

### 7. 验证合约（可选）

在 Etherscan 上验证合约代码：

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "Bars Help Bars Recipe" "BHBR"
```

## 🔧 获取测试网 USDT

### Sepolia 测试网
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### Goerli 测试网
- [Goerli Faucet](https://goerlifaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/)

## 📝 合约信息

- **合约名称**: RecipeNFT
- **NFT名称**: Bars Help Bars Recipe
- **NFT符号**: BHBR
- **标准**: ERC-721
- **功能**: 鸡尾酒配方NFT铸造和管理

## 🔍 主要功能

1. **铸造NFT**: `mintRecipeNFT(string uri)`
2. **更新元数据**: `updateTokenURI(uint256 tokenId, string newURI)`
3. **停用NFT**: `deactivateRecipeNFT(uint256 tokenId)`
4. **重新激活**: `reactivateRecipeNFT(uint256 tokenId)`
5. **查询元数据**: `getRecipeMetadata(uint256 tokenId)`

## 🧪 测试

运行本地测试：
```bash
npm test
```

## ⚠️ 安全注意事项

1. **私钥安全**: 永远不要将私钥提交到代码仓库
2. **环境变量**: 确保 `.env` 文件已添加到 `.gitignore`
3. **测试网**: 部署前确保有足够的测试网USDT支付gas费
4. **合约验证**: 建议在Etherscan上验证合约代码

## 🆘 常见问题

### Q: 部署失败，显示 "insufficient funds"
A: 确保钱包中有足够的测试网USDT支付gas费

### Q: 网络连接错误
A: 检查RPC URL是否正确，确保API密钥有效

### Q: 编译错误
A: 确保所有依赖已正确安装，检查Solidity版本兼容性

## 📞 支持

如果遇到问题，请检查：
1. 网络连接
2. 环境变量配置
3. 钱包余额
4. 合约代码语法 