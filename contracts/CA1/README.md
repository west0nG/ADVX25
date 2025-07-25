# Bars Help Bars - 智能合约

这是Bars Help Bars项目的智能合约部分，实现了基于ERC-6551和ERC-4907标准的NFT系统。

## 📋 合约概述

### IDNFT.sol - 酒吧身份NFT合约
- **标准**: ERC-6551 (Token Bound Account)
- **功能**: 酒吧身份认证与授权管理
- **特点**: 
  - 一个地址只能拥有一个ID NFT
  - ID NFT不可转移（符合ERC-6551标准）
  - 支持元数据更新
  - 支持激活/停用状态管理

## 🚀 快速开始

### 1. 安装依赖
```bash
cd contracts
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
# 本地网络
npm run deploy

# 测试网络
npm run deploy:testnet

# 主网
npm run deploy:mainnet

# Injective 测试网
npm run deploy:injective
```

## 📝 合约功能

### ID NFT 管理

#### 创建ID NFT
```solidity
function createIDNFT(
    address to,
    string memory tokenURI
) external onlyOwner returns (uint256)
```

**参数说明:**
- `to`: 接收者地址
- `tokenURI`: IPFS元数据URI

**Gas优化**: 链上只存储IPFS URI，大幅降低gas费用

#### 更新元数据
```solidity
function updateMetadata(
    uint256 tokenId,
    string memory tokenURI
) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId)
```

#### 查询功能
- `getBarMetadata(tokenId)`: 获取酒吧元数据
- `hasActiveIDNFT(user)`: 检查用户是否有活跃的ID NFT
- `getTokenIdByAddress(user)`: 获取用户的token ID
- `getAddressByTokenId(tokenId)`: 获取token的所有者地址

## 🔧 后端集成

### 环境变量配置
```bash
# 后端 .env 文件
WEB3_PROVIDER_URL=http://localhost:8545
IDNFT_CONTRACT_ADDRESS=0x...  # 部署后的合约地址
ADMIN_PRIVATE_KEY=0x...       # 管理员私钥

# Injective 测试网配置
INJECTIVE_TESTNET_URL=https://testnet.sentry.tm.injective.network:26657
CHAIN_ID=888
```

### API 端点

#### 创建ID NFT（直接提供IPFS URI）
```http
POST /api/v1/nfts/create-id-nft
Content-Type: application/json

{
  "user_address": "0x...",
  "token_uri": "ipfs://..."
}
```

#### 创建ID NFT（自动上传到IPFS）
```http
POST /api/v1/nfts/create-id-nft-with-data
Content-Type: application/json

{
  "user_address": "0x...",
  "bar_photo": "https://...",
  "bar_name": "酒吧名称",
  "bar_location": "酒吧位置",
  "bar_intro": "酒吧简介"
}
```

#### 获取用户ID NFT
```http
GET /api/v1/nfts/user/{user_address}/id-nft
```

#### 更新元数据
```http
PUT /api/v1/nfts/user/{user_address}/update-metadata
Content-Type: application/json

{
  "token_uri": "ipfs://..."
}
```

#### 检查合约状态
```http
GET /api/v1/nfts/contract/status
```

#### 获取IPFS元数据
```http
GET /api/v1/nfts/metadata/{ipfs_uri}
```

## 🧪 测试

### 运行测试
```bash
npm test
```

### 测试网络部署
```bash
# 部署到Sepolia测试网
npm run deploy:testnet

# 部署到Injective测试网
npm run deploy:injective

# 测试Injective测试网上的合约
npm run test:injective
```

## 📊 Gas 优化

合约已进行以下优化：
- 使用 `uint256` 替代 `uint` 以节省gas
- 优化存储布局
- 使用事件记录重要操作
- 实现批量操作接口

## 🔒 安全特性

- **访问控制**: 使用 `onlyOwner` 和 `onlyTokenOwner` 修饰符
- **输入验证**: 验证地址格式和字符串长度
- **状态检查**: 确保操作在正确的状态下执行
- **事件记录**: 记录所有重要操作用于审计

## 📈 监控和事件

### 重要事件
- `IDNFTCreated`: ID NFT创建事件
- `MetadataUpdated`: 元数据更新事件
- `IDNFTDeactivated`: ID NFT停用事件
- `IDNFTReactivated`: ID NFT重新激活事件

## 🚨 注意事项

1. **私钥安全**: 确保管理员私钥安全存储
2. **Gas费用**: 部署和调用合约需要足够的ETH支付gas费用
3. **网络选择**: 根据需求选择合适的网络（测试网/主网）
4. **合约升级**: 当前合约不支持升级，部署前请充分测试

## 🤝 贡献

欢迎提交Issue和Pull Request来改进合约功能。

## 🔗 相关链接

- [Injective 测试网部署指南](./INJECTIVE_DEPLOYMENT_GUIDE.md)
- [Injective 官方文档](https://docs.injective.network/)
- [Injective 测试网水龙头](https://testnet.faucet.injective.network/)
- [Injective 测试网区块浏览器](https://testnet.explorer.injective.network/)

## �� 许可证

MIT License 