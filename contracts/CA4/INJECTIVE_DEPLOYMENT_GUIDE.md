# CA4 - Injective 测试网部署指南

本指南将帮助你将CA4（Recipe NFT授权购买市场）完整套件部署到Injective测试网。

## 📋 项目概述

CA4包含以下合约：
- **MockUSDT**: 模拟USDT代币合约（用于测试）
- **IDNFT**: 酒吧身份NFT合约（ERC-6551标准）
- **RecipeNFT**: 鸡尾酒配方NFT合约（ERC-4907标准）
- **RecipeMarketplace**: Recipe NFT授权购买市场合约

## 🚀 快速开始

### 1. 环境准备

确保你的系统已安装：
- Node.js (推荐 v18+)
- npm 或 yarn

### 2. 获取测试网代币

在部署前，你需要获取Injective测试网的INJ代币：
- 访问 [Injective 测试网水龙头](https://testnet.faucet.injective.network/)
- 输入你的钱包地址获取测试网INJ

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp env.example .env

# 编辑 .env 文件，添加以下配置：
PRIVATE_KEY=0x你的私钥
INJECTIVE_TESTNET_URL=https://your-rpc-url
```

### 4. 一键部署

```bash
# 给脚本执行权限
chmod +x deploy-injective.sh

# 运行一键部署脚本
./deploy-injective.sh
```

或者手动部署：

```bash
# 安装依赖
npm install

# 编译合约
npm run compile

# 部署到Injective测试网
npm run deploy:injective

# 测试合约功能
npm run test:injective
```

## 📦 合约地址

部署完成后，你将获得以下合约地址：

- **MockUSDT**: `0x9799F9f9388FF7526c13d200e142f6ff551932bb`
- **IDNFT**: `0xc64b0D4AF9B40f1C8A816A7AAE55723e320574FA`
- **RecipeNFT**: `0xa5A3B598C57174c0894Be1B6c8866845eE1D8556`
- **RecipeMarketplace**: `0x2706178d4D6dD847b929A1B87B738eFaac7354AF`

## 🔧 网络配置

### Injective 测试网信息
- **网络名称**: Injective Testnet
- **RPC URL**: `https://testnet.injective.network:26657`
- **Chain ID**: 1439
- **代币符号**: INJ
- **区块浏览器**: https://testnet.explorer.injective.network/

### Hardhat 配置

```javascript
injective_testnet: {
  url: process.env.INJECTIVE_TESTNET_URL || "https://testnet.injective.network:26657",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 1439,
  timeout: 60000,
  gasPrice: 5000000000, // 5 gwei
  gas: 8000000,
  httpHeaders: {
    "Content-Type": "application/json"
  }
}
```

## 🧪 测试功能

部署完成后，测试脚本将验证以下功能：

### 1. 基础功能测试
- ✅ 合约基本信息（名称、符号）
- ✅ 合约所有者验证
- ✅ USDT余额检查

### 2. NFT功能测试
- ✅ ID NFT状态检查
- ✅ Recipe NFT元数据查询
- ✅ NFT铸造功能

### 3. 市场功能测试
- ✅ 市场合约配置验证
- ✅ 平台费用设置（2.5%）
- ✅ 授权期限设置（365天）

### 4. ERC-4907功能测试
- ✅ 用户授权设置
- ✅ 授权过期时间管理
- ✅ 访问权限验证

## 📊 合约功能

### MockUSDT
- 模拟USDT代币，6位小数
- 支持铸造和销毁（仅所有者）
- 用于测试市场支付功能

### IDNFT (ERC-6551)
- 酒吧身份认证NFT
- 一个地址只能拥有一个ID NFT
- 支持元数据更新和状态管理

### RecipeNFT (ERC-4907)
- 鸡尾酒配方NFT
- 支持临时用户授权访问
- 可设置授权价格和状态

### RecipeMarketplace
- Recipe NFT授权购买市场
- 支持USDT支付
- 平台费用管理（2.5%）
- 完整的交易流程

## 🔗 相关链接

- [Injective 官方文档](https://docs.injective.network/)
- [Injective 测试网水龙头](https://testnet.faucet.injective.network/)
- [Injective 测试网区块浏览器](https://testnet.explorer.injective.network/)
- [ERC-4907 标准](https://eips.ethereum.org/EIPS/eip-4907)
- [ERC-6551 标准](https://eips.ethereum.org/EIPS/eip-6551)

## 🚨 注意事项

1. **私钥安全**: 确保私钥安全存储，不要提交到版本控制系统
2. **Gas费用**: 部署和调用合约需要足够的INJ支付gas费用
3. **测试网**: 这是测试网环境，合约地址和功能可能与主网不同
4. **RPC限制**: 某些RPC提供商可能有请求限制，建议使用可靠的RPC服务

## 🤝 故障排除

### 常见问题

1. **部署失败 - 余额不足**
   ```
   解决方案: 从水龙头获取更多测试网INJ
   ```

2. **RPC连接失败**
   ```
   解决方案: 检查RPC URL是否正确，尝试其他RPC提供商
   ```

3. **Gas费用过高**
   ```
   解决方案: 调整hardhat.config.js中的gasPrice设置
   ```

4. **合约验证失败**
   ```
   解决方案: 确保所有依赖合约都已正确部署
   ```

## 📝 更新日志

- **v1.0.0**: 初始版本，支持Injective测试网部署
- 包含完整的CA4合约套件
- 支持ERC-4907和ERC-6551标准
- 完整的市场功能实现

---

如有问题，请查看项目README或提交Issue。 