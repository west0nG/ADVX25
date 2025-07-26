# Injective 测试网部署指南

本指南将帮助你将CA1中的智能合约部署到Injective测试网上。

## 📋 前置要求

### 1. 安装依赖
```bash
cd contracts/CA1
npm install
```

### 2. 获取测试网INJ代币
在部署之前，你需要获取一些测试网的INJ代币来支付gas费用：

1. 访问 [Injective 测试网水龙头](https://testnet.faucet.injective.network/)
2. 输入你的钱包地址
3. 获取测试网INJ代币

### 3. 配置环境变量
```bash
cp env.example .env
```

编辑 `.env` 文件，添加以下配置：
```bash
# Injective 测试网配置
INJECTIVE_TESTNET_URL=https://testnet.sentry.tm.injective.network:26657
ADMIN_PRIVATE_KEY=你的私钥（0x开头）

# 可选：自定义RPC URL
# INJECTIVE_TESTNET_URL=https://your-custom-rpc-url
```

## 🚀 部署步骤

### 1. 编译合约
```bash
npm run compile
```

### 2. 部署到Injective测试网
```bash
npm run deploy:injective
```

### 3. 验证部署
部署完成后，脚本会自动：
- 验证合约代码
- 测试基本功能
- 保存部署信息到 `deployment-info.json`

## 📊 网络信息

### Injective 测试网
- **网络名称**: Injective Testnet
- **Chain ID**: 888
- **RPC URL**: https://testnet.sentry.tm.injective.network:26657
- **代币符号**: INJ
- **区块浏览器**: https://testnet.explorer.injective.network/

## 🔧 配置说明

### Hardhat配置
在 `hardhat.config.js` 中，我们添加了以下Injective测试网配置：

```javascript
injective_testnet: {
  url: process.env.INJECTIVE_TESTNET_URL || "https://testnet.sentry.tm.injective.network:26657",
  accounts: process.env.ADMIN_PRIVATE_KEY ? [process.env.ADMIN_PRIVATE_KEY] : [],
  chainId: 888,
  timeout: 60000,
  gasPrice: 5000000000, // 5 gwei
  gas: 8000000
}
```

### Gas费用优化
- **Gas Price**: 5 gwei（可根据网络拥堵情况调整）
- **Gas Limit**: 8,000,000（足够部署复杂合约）

## 🧪 测试部署

部署完成后，你可以使用以下命令测试合约功能：

```bash
# 运行自动化测试
npm test

# 运行手动测试脚本
npm run test:manual
```

## 📝 部署后操作

### 1. 保存合约地址
部署完成后，合约地址会保存在 `deployment-info.json` 文件中：

```json
{
  "network": "injective_testnet",
  "contract": "IDNFT",
  "address": "0x...",
  "deployer": "0x...",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "chainId": 888
}
```

### 2. 更新后端配置
如果你的后端需要连接到Injective测试网，请更新相关配置：

```bash
# 后端 .env 文件
WEB3_PROVIDER_URL=https://testnet.sentry.tm.injective.network:26657
IDNFT_CONTRACT_ADDRESS=0x...  # 部署后的合约地址
ADMIN_PRIVATE_KEY=0x...       # 管理员私钥
CHAIN_ID=888
```

### 3. 验证合约
你可以在Injective测试网区块浏览器上查看你的合约：
https://testnet.explorer.injective.network/

## 🚨 注意事项

### 1. 私钥安全
- 永远不要在代码中硬编码私钥
- 使用环境变量存储敏感信息
- 考虑使用硬件钱包进行生产环境部署

### 2. Gas费用
- Injective测试网的gas费用相对较低
- 建议在部署前检查网络状态
- 可以根据需要调整gas price

### 3. 网络稳定性
- Injective测试网可能会有网络波动
- 如果部署失败，请稍后重试
- 建议在低峰期进行部署

### 4. 合约兼容性
- 确保你的合约与EVM兼容
- 测试所有功能在Injective上的表现
- 注意Injective特有的功能限制

## 🔍 故障排除

### 常见问题

1. **部署失败 - 余额不足**
   ```
   解决方案: 从水龙头获取更多测试网INJ
   ```

2. **部署失败 - 网络连接问题**
   ```
   解决方案: 检查RPC URL，尝试使用备用节点
   ```

3. **Gas费用过高**
   ```
   解决方案: 调整hardhat.config.js中的gasPrice
   ```

4. **合约验证失败**
   ```
   解决方案: 检查合约代码，确保没有语法错误
   ```

## 📞 支持

如果在部署过程中遇到问题，请：

1. 检查本指南的故障排除部分
2. 查看Injective官方文档
3. 在项目Issues中报告问题

## 🔗 相关链接

- [Injective 官方文档](https://docs.injective.network/)
- [Injective 测试网水龙头](https://testnet.faucet.injective.network/)
- [Injective 测试网区块浏览器](https://testnet.explorer.injective.network/)
- [Hardhat 文档](https://hardhat.org/docs) 