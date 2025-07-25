# ⚡ 快速开始指南

## 🚀 一键部署到Sepolia测试网

### 步骤1: 环境准备

1. **获取Sepolia测试ETH**
   - 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
   - 输入你的钱包地址获取测试ETH

2. **获取Infura API密钥**
   - 访问 [Infura](https://infura.io/)
   - 创建项目并复制Sepolia RPC URL

3. **配置环境文件**
   ```bash
   cp env.example .env
   ```
   
   编辑 `.env` 文件：
   ```env
   SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
   PRIVATE_KEY=your_wallet_private_key_here
   ```

### 步骤2: 一键部署

运行一键部署脚本：
```bash
./deploy-and-test.sh
```

脚本会自动：
- ✅ 检查环境配置
- ✅ 编译智能合约
- ✅ 部署到Sepolia测试网
- ✅ 启动前端服务器

### 步骤3: 测试功能

1. **访问前端界面**
   - 打开浏览器访问: `http://localhost:8000/idnft-mint.html`

2. **连接钱包**
   - 确保MetaMask已安装
   - 切换到Sepolia测试网
   - 点击"连接钱包"

3. **铸造NFT**
   - 输入部署的合约地址
   - 点击"铸造 ERC-6551 ID NFT"
   - 在MetaMask中确认交易

## 🔧 手动部署（可选）

如果你更喜欢手动操作：

### 1. 编译合约
```bash
npx hardhat compile
```

### 2. 部署简化版合约
```bash
npx hardhat run scripts/deploy-simple.js --network sepolia
```

### 3. 启动前端
```bash
cd ../../test-deployment/frontend
./start.sh
```

## 📋 部署后信息

部署成功后会显示：
- ✅ 合约地址
- ✅ Etherscan链接
- ✅ 合约基本信息

**请记录合约地址！**

## 🛠️ 故障排除

### 常见问题

1. **余额不足**
   ```
   Error: insufficient funds for gas * price + value
   ```
   **解决**: 获取更多Sepolia测试ETH

2. **网络连接失败**
   ```
   Error: could not detect network
   ```
   **解决**: 检查Infura RPC URL

3. **私钥错误**
   ```
   Error: invalid private key
   ```
   **解决**: 检查.env文件中的私钥格式

## 🎯 测试清单

部署完成后，请测试以下功能：

- [ ] 连接MetaMask钱包
- [ ] 铸造ERC-6551 ID NFT
- [ ] 查询NFT信息
- [ ] 更新NFT元数据
- [ ] 停用/激活NFT
- [ ] 查询ERC-6551账户地址

## 📞 获取帮助

如果遇到问题：
1. 检查控制台错误信息
2. 确认环境变量配置
3. 验证网络连接
4. 检查钱包余额

## 🎉 成功！

恭喜！你的ERC-6551 ID NFT合约已经成功部署到Sepolia测试网！

现在你可以：
- 使用前端界面测试所有功能
- 分享合约地址给其他人测试
- 准备部署到主网（需要真实ETH） 