# CA2 RecipeNFT - Injective 测试网部署指南

本指南将帮助你将CA2中的RecipeNFT合约部署到Injective测试网上。

## 📋 合约概述

### RecipeNFT.sol - 鸡尾酒配方NFT合约
- **标准**: ERC-721 + ERC-4907
- **功能**: 鸡尾酒配方NFT的铸造、管理和授权
- **特点**: 
  - 支持ERC-4907临时用户授权
  - 支持配方元数据管理
  - 支持授权价格设置
  - 支持激活/停用状态管理

## 🚀 快速开始

### 1. 安装依赖
```bash
cd contracts/CA2
npm install
```

### 2. 配置环境变量
```bash
cp env.example .env
# 编辑 .env 文件，填入你的配置
```

### 3. 编译合约
```bash
npm run compile
```

### 4. 部署合约
```bash
# 使用一键部署脚本
./deploy-injective.sh

# 或使用npm命令
npm run deploy:injective
```

## 📝 合约功能

### Recipe NFT 管理

#### 铸造Recipe NFT
```solidity
function mintRecipeNFT(
    string memory uri
) external returns (uint256)
```

**参数说明:**
- `uri`: IPFS元数据URI

#### 更新元数据
```solidity
function updateTokenURI(
    uint256 tokenId,
    string memory newURI
) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId)
```

#### ERC-4907 用户授权
```solidity
function setUser(
    uint256 tokenId,
    address user,
    uint64 expires
) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId)
```

#### 设置授权价格
```solidity
function setPrice(
    uint256 tokenId,
    uint256 price
) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId)
```

## 🔧 后端集成

### 环境变量配置
```bash
# 后端 .env 文件
WEB3_PROVIDER_URL=https://clean-cool-dust.injective-testnet.quiknode.pro/f2dcf86a3537602a3470aa71713305c63797504d
RECIPENFT_CONTRACT_ADDRESS=0x8035fb3F9387C6c09421f2bE7eA797857Dc9fFc9
PRIVATE_KEY=0x...       # 管理员私钥
CHAIN_ID=1439
```

### API 端点

#### 铸造Recipe NFT
```http
POST /api/v1/recipes/mint
Content-Type: application/json

{
  "token_uri": "ipfs://..."
}
```

#### 获取用户Recipe NFTs
```http
GET /api/v1/recipes/user/{user_address}
```

#### 设置用户授权
```http
POST /api/v1/recipes/{token_id}/set-user
Content-Type: application/json

{
  "user_address": "0x...",
  "expires": 1234567890
}
```

#### 设置授权价格
```http
POST /api/v1/recipes/{token_id}/set-price
Content-Type: application/json

{
  "price": "1000000000000000000"  // 1 USDT in wei
}
```

## 🧪 测试

### 运行测试
```bash
npm test
```

### 测试Injective测试网上的合约
```bash
npm run test:injective
```

## 📊 Gas 优化

合约已进行以下优化：
- 使用 `uint256` 替代 `uint` 以节省gas
- 优化存储布局
- 使用事件记录重要操作
- 实现批量操作接口

## 🔒 安全特性

- **访问控制**: 使用 `onlyTokenOwner` 和 `onlyActiveToken` 修饰符
- **输入验证**: 验证地址格式和字符串长度
- **状态检查**: 确保操作在正确的状态下执行
- **事件记录**: 记录所有重要操作用于审计

## 📈 监控和事件

### 重要事件
- `RecipeNFTCreated`: Recipe NFT创建事件
- `RecipeMetadataUpdated`: 元数据更新事件
- `UserUpdated`: 用户授权更新事件
- `PriceSet`: 价格设置事件

## 🚨 注意事项

1. **私钥安全**: 确保管理员私钥安全存储
2. **Gas费用**: 部署和调用合约需要足够的INJ支付gas费用
3. **网络选择**: 根据需求选择合适的网络（测试网/主网）
4. **合约升级**: 当前合约不支持升级，部署前请充分测试

## 🤝 贡献

欢迎提交Issue和Pull Request来改进合约功能。

## 🔗 相关链接

- [Injective 官方文档](https://docs.injective.network/)
- [Injective 测试网水龙头](https://testnet.faucet.injective.network/)
- [Injective 测试网区块浏览器](https://testnet.explorer.injective.network/)

## �� 许可证

MIT License 