# 🚀 RecipeNFT 快速开始指南

## 📋 项目概述

RecipeNFT 是一个基于 ERC-721 标准的鸡尾酒配方 NFT 智能合约，允许用户铸造、管理和交易鸡尾酒配方 NFT。

## 🎯 主要功能

- ✅ **NFT 铸造**: 任何用户都可以铸造自己的 Recipe NFT
- ✅ **元数据管理**: 更新 NFT 的 IPFS 元数据 URI
- ✅ **激活控制**: 停用和重新激活 NFT
- ✅ **查询功能**: 查询 NFT 元数据和拥有者信息
- ✅ **事件记录**: 完整的操作事件记录

## 🛠️ 快速开始

### 1. 环境准备

```bash
# 进入CA2目录
cd contracts/CA2

# 运行启动脚本
./start-test.sh
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑.env文件，添加以下配置
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_API_KEY
```

### 3. 部署合约

```bash
# 编译合约
npm run compile

# 部署到Sepolia测试网
npx hardhat run scripts/deploy.js --network sepolia

# 部署到Goerli测试网
npx hardhat run scripts/deploy.js --network goerli
```

### 4. 测试合约

1. 在浏览器中打开 `test-frontend.html`
2. 连接 MetaMask 钱包
3. 输入部署的合约地址
4. 开始测试各种功能

## 📁 文件结构

```
CA2/
├── contracts/
│   └── RecipeNFT.sol          # 主合约文件
├── scripts/
│   └── deploy.js              # 部署脚本
├── test/
│   └── RecipeNFT.test.js      # 测试文件
├── DEPLOYMENT_GUIDE.md        # 详细部署指南
├── test-frontend.html         # 测试前端页面
├── start-test.sh              # 启动脚本
├── hardhat.config.js          # Hardhat配置
├── package.json               # 项目依赖
└── env.example                # 环境变量模板
```

## 🔧 合约功能详解

### 铸造 NFT
```solidity
function mintRecipeNFT(string memory uri) external returns (uint256)
```
- 参数: `uri` - IPFS 元数据 URI
- 返回: 新铸造的 Token ID

### 更新元数据
```solidity
function updateTokenURI(uint256 tokenId, string memory newURI) external
```
- 仅 Token 拥有者可调用
- 仅激活状态的 NFT 可更新

### 停用/激活 NFT
```solidity
function deactivateRecipeNFT(uint256 tokenId) external
function reactivateRecipeNFT(uint256 tokenId) external
```

### 查询功能
```solidity
function getRecipeMetadata(uint256 tokenId) external view returns (...)
function getTokenIdsByOwner(address owner) external view returns (uint256[])
```

## 🌐 支持的测试网

- **Sepolia**: 推荐使用，最新的测试网
- **Goerli**: 稳定可靠的测试网
- **本地网络**: 用于开发和测试

## 💰 获取测试网 ETH

### Sepolia
- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

### Goerli
- [Goerli Faucet](https://goerlifaucet.com/)
- [Chainlink Faucet](https://faucets.chain.link/)

## 🔍 测试用例

### 基本测试流程

1. **连接钱包**: 确保 MetaMask 连接到正确的测试网
2. **加载合约**: 输入部署的合约地址
3. **铸造 NFT**: 使用 IPFS URI 铸造新的 Recipe NFT
4. **查询信息**: 查看 NFT 的元数据和状态
5. **管理 NFT**: 更新元数据、停用/激活 NFT

### 示例 IPFS URI

```
ipfs://QmYourMetadataHash
```

元数据 JSON 格式示例:
```json
{
  "name": "经典马提尼",
  "description": "传统的马提尼鸡尾酒配方",
  "image": "ipfs://QmImageHash",
  "attributes": [
    {
      "trait_type": "酒精度",
      "value": "40%"
    },
    {
      "trait_type": "难度",
      "value": "简单"
    }
  ]
}
```

## ⚠️ 注意事项

1. **私钥安全**: 永远不要将私钥提交到代码仓库
2. **测试网**: 确保有足够的测试网 ETH 支付 gas 费
3. **网络切换**: 在 MetaMask 中切换到正确的测试网
4. **合约验证**: 建议在 Etherscan 上验证合约代码

## 🆘 常见问题

**Q: 部署失败，显示 "insufficient funds"**
A: 确保钱包中有足够的测试网 ETH

**Q: 合约加载失败**
A: 检查合约地址是否正确，确保在正确的网络上

**Q: 交易失败**
A: 检查 gas 费用设置，确保网络连接正常

## 📞 技术支持

如果遇到问题，请检查：
1. 网络连接状态
2. 环境变量配置
3. 钱包余额
4. 合约代码语法

---

🎉 **开始你的 RecipeNFT 之旅吧！** 