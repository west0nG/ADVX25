# 🧪 ID NFT 6551 测试部署包

这个文件夹包含了完整的基于ERC-6551标准的ID NFT智能合约测试部署工具包，让你可以轻松在Sepolia测试网上部署和测试你的ERC-6551 ID NFT合约。

## 📁 文件夹结构

```
test-deployment/
├── README.md                 # 本文件
├── DEPLOYMENT_GUIDE.md       # 详细部署指南
├── QUICK_START.md           # 快速开始指南
└── frontend/                # 前端界面
    ├── idnft-mint.html      # NFT铸造界面
    └── start.sh             # 前端启动脚本
```

## 🚀 快速开始

### 1. 部署智能合约
```bash
# 进入合约目录
cd ../contracts/CA1

# 安装依赖
npm install

# 配置环境变量
cp env.example .env
# 编辑 .env 文件，添加你的私钥和API密钥

# 编译合约
npx hardhat compile

# 部署到Sepolia测试网
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. 启动前端界面
```bash
# 进入前端目录
cd frontend

# 启动服务器
./start.sh

# 在浏览器中打开
# http://localhost:8000/idnft-mint.html
```

## 📖 详细文档

- **DEPLOYMENT_GUIDE.md** - 完整的部署指南，包含所有配置步骤
- **QUICK_START.md** - 简化的快速开始指南

## 🎯 功能特性

### 智能合约功能
- ✅ ERC-6551标准Token Bound Account
- ✅ 身份NFT铸造
- ✅ 元数据URI管理
- ✅ 所有权验证
- ✅ 每个NFT拥有独立钱包地址

### 前端界面功能
- ✅ MetaMask钱包连接
- ✅ Sepolia网络检测
- ✅ NFT铸造界面
- ✅ NFT查询功能
- ✅ 实时交易状态
- ✅ 响应式设计

## 🔧 技术栈

- **智能合约**: Solidity 0.8.20 + ERC-6551
- **开发框架**: Hardhat
- **前端**: HTML5 + CSS3 + JavaScript
- **Web3库**: Ethers.js 5.7.2
- **测试网络**: Sepolia
- **NFT标准**: ERC-6551 Token Bound Account

## 🛡️ 安全提醒

⚠️ **重要安全注意事项**：
- 仅使用测试钱包进行测试
- 不要在测试钱包中存储真实资产
- 定期更换测试私钥
- 永远不要将真实私钥提交到Git仓库

## 🐛 故障排除

如果遇到问题，请查看：
1. `DEPLOYMENT_GUIDE.md` 中的故障排除部分
2. 浏览器控制台错误信息
3. MetaMask交易历史
4. Sepolia Etherscan交易状态

## 📞 支持

如需帮助，请检查：
- 网络连接状态
- MetaMask配置
- 环境变量设置
- 合约部署状态

---

**祝你测试愉快！🎉** 