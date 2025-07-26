# 🚀 部署到Sepolia测试网指南

## 📋 前置要求

### 1. 获取Sepolia测试USDT
- 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
- 或使用 [Alchemy Faucet](https://sepoliafaucet.com/)
- 确保你的钱包有至少0.1 USDT用于部署和测试

### 2. 获取必要的API密钥

#### Infura API密钥
1. 访问 [Infura](https://infura.io/)
2. 注册/登录账户
3. 创建新项目
4. 复制项目的Sepolia RPC URL

#### Etherscan API密钥
1. 访问 [Etherscan](https://etherscan.io/)
2. 注册/登录账户
3. 进入API-KEYs页面
4. 创建新的API密钥

## 🔧 环境配置

### 1. 创建环境文件
```bash
cp env.example .env
```

### 2. 配置环境变量
编辑 `.env` 文件，填入以下信息：

```env
# Web3 Provider URLs
WEB3_PROVIDER_URL=http://localhost:8545
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
MAINNET_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID

# Contract Addresses (部署后填写)
IDNFT_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Admin Private Key (用于合约调用)
PRIVATE_KEY=your_wallet_private_key_here

# Etherscan API Key (用于合约验证)
USDTERSCAN_API_KEY=your_etherscan_api_key_here

# Gas Reporter
REPORT_GAS=true
```

### 3. 获取钱包私钥
⚠️ **安全提醒**: 私钥非常重要，请确保安全！

1. 打开MetaMask
2. 点击账户图标 → 账户详情
3. 点击"导出私钥"
4. 输入密码后复制私钥
5. 将私钥粘贴到 `.env` 文件的 `PRIVATE_KEY=` 后面

## 🚀 部署步骤

### 1. 编译合约
```bash
npx hardhat compile
```

### 2. 部署到Sepolia
```bash
# 部署完整版ERC-6551合约
npx hardhat run scripts/deploy-6551.js --network sepolia

# 或者部署简化版合约（用于测试）
npx hardhat run scripts/deploy-simple.js --network sepolia
```

### 3. 记录部署信息
部署成功后，你会看到类似以下输出：
```
✅ IDNFT6551 合约部署成功!
📍 合约地址: 0x1234567890abcdef...
🔗 Sepolia Etherscan: https://sepolia.etherscan.io/address/0x1234567890abcdef...
```

**请记录合约地址！**

### 4. 验证合约（可选）
```bash
npx hardhat verify --network sepolia 0xYOUR_CONTRACT_ADDRESS "ID NFT 6551" "IDNFT6551"
```

## 🌐 启动前端测试

### 1. 启动前端服务器
```bash
cd ../../test-deployment/frontend
./start.sh
```

### 2. 访问前端界面
打开浏览器访问: `http://localhost:8000/idnft-mint.html`

### 3. 连接钱包
1. 确保MetaMask已安装
2. 切换到Sepolia测试网
3. 点击"连接钱包"按钮

### 4. 测试功能
1. 输入部署的合约地址
2. 点击"铸造 ERC-6551 ID NFT"
3. 在MetaMask中确认交易
4. 等待交易确认

## 🔍 验证部署

### 1. 在Etherscan查看
- 访问: `https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS`
- 查看合约代码和交易记录

### 2. 测试合约功能
- 铸造NFT
- 查询NFT信息
- 更新元数据
- 停用/激活NFT

## 🛠️ 故障排除

### 常见问题

#### 1. 部署失败 - 余额不足
```
Error: insufficient funds for gas * price + value
```
**解决方案**: 获取更多Sepolia测试USDT

#### 2. 部署失败 - 网络连接问题
```
Error: could not detect network
```
**解决方案**: 检查Infura RPC URL是否正确

#### 3. 前端连接失败
```
Error: MetaMask not found
```
**解决方案**: 确保MetaMask已安装并解锁

#### 4. 交易失败 - 网络错误
```
Error: network does not match
```
**解决方案**: 确保MetaMask切换到Sepolia测试网

## 📞 获取帮助

如果遇到问题：
1. 检查控制台错误信息
2. 确认环境变量配置正确
3. 验证网络连接
4. 检查钱包余额

## 🎉 成功部署后

恭喜！你的ERC-6551 ID NFT合约已经成功部署到Sepolia测试网！

现在你可以：
- 使用前端界面测试所有功能
- 分享合约地址给其他人测试
- 准备部署到主网（需要真实USDT） 