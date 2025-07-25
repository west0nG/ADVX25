# 🚀 ID NFT 6551 快速开始指南

## 📋 前置要求

1. **MetaMask 钱包**
   - 安装 [MetaMask 浏览器扩展](https://metamask.io/)
   - 创建或导入钱包

2. **Sepolia 测试网 ETH**
   - 访问 [Sepolia Faucet](https://sepoliafaucet.com/)
   - 输入你的钱包地址获取测试网ETH

3. **Node.js 环境**
   - 确保已安装 Node.js (版本 14+)

## 🛠️ 部署步骤

### 1. 配置环境变量

```bash
cd contracts/CA1
cp env.example .env
```

编辑 `.env` 文件：
```env
PRIVATE_KEY=你的私钥（不要带0x前缀）
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=你的Etherscan API密钥
```

### 2. 安装依赖

```bash
npm install
```

### 3. 编译合约

```bash
npx hardhat compile
```

### 4. 部署到 Sepolia

```bash
# 部署ERC-6551合约
npx hardhat run scripts/deploy-6551.js --network sepolia
```

部署成功后会显示合约地址，请保存这个地址！

### 5. 验证合约（可选）

```bash
npx hardhat verify --network sepolia 你的合约地址
```

## 🎨 使用前端界面

### 1. 启动前端服务器

```bash
cd frontend
./start.sh
```

### 2. 打开浏览器

访问 `http://localhost:8000/idnft-mint.html`

### 3. 连接钱包

1. 点击"连接钱包"按钮
2. 在 MetaMask 中确认连接
3. 确保切换到 Sepolia 测试网

### 4. 铸造 NFT

1. 输入部署的合约地址
2. 输入接收地址（或使用当前钱包地址）
3. 点击"铸造 ID NFT"
4. 在 MetaMask 中确认交易

## 🔍 测试功能

### 查询 NFT
- 点击"查询我的 NFT"查看已拥有的 NFT

### 查看交易
- 在 [Sepolia Etherscan](https://sepolia.etherscan.io/) 查看交易详情

## 📱 NFT 元数据示例

铸造的 NFT 将包含以下元数据：

```json
{
  "name": "ID NFT 6551 #1",
  "description": "这是一个基于ERC-6551标准的身份NFT，拥有自己的钱包地址，可以持有其他代币和NFT。",
  "image": "https://ipfs.io/ipfs/QmYourImageHash",
  "attributes": [
    {
      "trait_type": "身份类型",
      "value": "ERC-6551数字公民"
    },
    {
      "trait_type": "稀有度",
      "value": "传奇"
    },
    {
      "trait_type": "铸造时间",
      "value": "2024-01-01T00:00:00.000Z"
    },
    {
      "trait_type": "区块链",
      "value": "Sepolia测试网"
    },
    {
      "trait_type": "标准",
      "value": "ERC-6551"
    },
    {
      "trait_type": "功能",
      "value": "Token Bound Account"
    }
  ]
}
```

## 🐛 故障排除

### 常见问题

1. **"请安装MetaMask钱包"**
   - 确保已安装 MetaMask 浏览器扩展

2. **"请切换到Sepolia测试网"**
   - 在 MetaMask 中切换到 Sepolia 测试网

3. **"Gas费用不足"**
   - 确保钱包中有足够的 Sepolia ETH

4. **"连接钱包失败"**
   - 检查 MetaMask 是否已解锁
   - 确认已授权网站连接

5. **"铸造失败"**
   - 检查合约地址是否正确
   - 确认网络连接正常
   - 查看浏览器控制台错误信息

## 📞 获取帮助

如果遇到问题，请检查：

1. 浏览器控制台错误信息
2. MetaMask 交易历史
3. Sepolia Etherscan 交易状态
4. 网络连接状态

## 🎯 下一步

成功部署和测试后，你可以：

1. 自定义 NFT 元数据
2. 添加更多功能（如批量铸造）
3. 部署到主网
4. 集成到其他应用

---

**祝你好运！🎉** 