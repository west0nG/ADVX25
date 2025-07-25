# ID NFT 智能合约部署指南 - Sepolia测试网

## 准备工作

### 1. 获取测试网ETH
- 访问 [Sepolia Faucet](https://sepoliafaucet.com/) 或 [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- 输入你的钱包地址获取测试网ETH

### 2. 配置环境变量
在 `contracts/CA1/` 目录下创建 `.env` 文件：

```bash
# 复制环境变量示例文件
cp env.example .env
```

编辑 `.env` 文件，添加以下内容：
```env
PRIVATE_KEY=你的私钥（不要带0x前缀）
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
ETHERSCAN_API_KEY=你的Etherscan API密钥
```

### 3. 获取必要的API密钥

#### Infura RPC URL
1. 访问 [Infura](https://infura.io/)
2. 注册账号并创建项目
3. 复制Sepolia网络的RPC URL

#### Etherscan API密钥
1. 访问 [Etherscan](https://etherscan.io/)
2. 注册账号并创建API密钥
3. 复制API密钥

## 部署步骤

### 1. 安装依赖
```bash
cd contracts/CA1
npm install
```

### 2. 编译合约
```bash
npx hardhat compile
```

### 3. 部署到Sepolia测试网
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### 4. 验证合约
部署完成后，你会得到合约地址。使用以下命令验证合约：
```bash
npx hardhat verify --network sepolia 合约地址
```

## 合约交互

### 1. 使用Hardhat控制台
```bash
npx hardhat console --network sepolia
```

### 2. 基本交互命令
```javascript
// 获取合约实例
const IDNFT = await ethers.getContractFactory("IDNFT");
const idnft = await IDNFT.attach("你的合约地址");

// 获取签名者
const [signer] = await ethers.getSigners();

// 铸造ID NFT
const tx = await idnft.mintIDNFT(signer.address, "https://your-metadata-uri.com/1.json");
await tx.wait();

// 查询NFT
const tokenURI = await idnft.tokenURI(1);
console.log("Token URI:", tokenURI);
```

## 测试合约

### 运行测试
```bash
npx hardhat test
```

### 运行特定测试
```bash
npx hardhat test test/IDNFT.test.js
```

## 故障排除

### 常见问题

1. **Gas费用不足**
   - 确保钱包中有足够的Sepolia ETH

2. **RPC连接失败**
   - 检查Infura项目ID是否正确
   - 确认网络选择为Sepolia

3. **私钥错误**
   - 确保私钥格式正确（64位十六进制字符）
   - 不要包含0x前缀

4. **合约验证失败**
   - 确保所有构造函数参数正确
   - 检查Etherscan API密钥

## 安全注意事项

⚠️ **重要安全提醒**：
- 永远不要将真实的私钥提交到Git仓库
- 使用专门的测试钱包进行测试
- 定期更换测试钱包的私钥
- 不要在测试钱包中存储真实资产

## 下一步

部署完成后，你可以：
1. 使用提供的前端界面进行交互
2. 测试各种功能
3. 收集用户反馈
4. 优化合约代码 