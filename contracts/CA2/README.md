# Bars Help Bars - RecipeNFT 合约 (CA2)

这是Bars Help Bars项目的RecipeNFT（鸡尾酒配方NFT）智能合约部分，实现了基于ERC-721标准的NFT系统，仅存储IPFS元数据URI。

## 📋 合约概述

### RecipeNFT.sol - 鸡尾酒配方NFT合约
- **标准**: ERC-721
- **功能**: 鸡尾酒配方知识产权管理
- **特点**:
  - 任何用户都可以铸造自己的Recipe NFT
  - 仅存储IPFS元数据URI，链下存储详细配方

## 🚀 快速开始

### 1. 安装依赖
```bash
cd contracts/CA2
npm install
```

### 2. 编译合约
```bash
npm run compile
```

### 3. 部署合约
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 📝 合约功能

### Recipe NFT 管理

#### 铸造Recipe NFT
```solidity
function mintRecipeNFT(string memory uri) external returns (uint256)
```
- `uri`: IPFS元数据URI
- 返回新NFT的tokenId

#### 查询元数据URI
```solidity
function getTokenURI(uint256 tokenId) external view returns (string memory)
```

## 🧪 测试

### 运行测试
```bash
npm test
```

## 🔒 安全特性
- 仅允许非空URI
- 使用OpenZeppelin安全库

## 🤝 贡献
欢迎提交Issue和Pull Request来改进合约功能。 