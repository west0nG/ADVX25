# ID NFT 功能设置指南

## 概述

BarsHelpBars 现在支持 ID NFT 功能，用户可以通过连接 MetaMask 钱包来检查是否拥有酒吧身份 NFT。如果没有，系统会弹出一个表单让用户填写酒吧信息并创建 ID NFT。

## 功能特性

- 🔗 **MetaMask 钱包连接**
- 🔍 **自动检查 ID NFT 状态**
- 📝 **酒吧信息表单**
- 🖼️ **图片上传支持**
- 🌐 **IPFS 元数据存储**
- 🎯 **智能合约交互**

## 设置步骤

### 1. 部署 CA1 合约

首先需要部署 ID NFT 合约到区块链网络：

```bash
cd contracts/CA1
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

记录部署的合约地址。

### 2. 配置合约地址

有两种方式配置合约地址：

#### 方式一：通过配置页面
1. 访问 `http://localhost:8000/pages/config.html`
2. 在"区块链配置"部分输入合约地址
3. 点击"保存配置"

#### 方式二：直接修改配置文件
编辑 `frontend/config/app.config.js`：

```javascript
blockchain: {
    // ... 其他配置
    idnftContractAddress: '0xYOUR_DEPLOYED_CONTRACT_ADDRESS',
    sepolia: {
        chainId: '0xaa36a7',
        rpcUrl: 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
        idnftContractAddress: '0xYOUR_DEPLOYED_CONTRACT_ADDRESS'
    }
}
```

### 3. 启动前端服务

```bash
cd frontend
npx live-server --port=8000 --host=localhost --open=/index.html --watch=. --ignore=node_modules
```

## 使用流程

### 1. 连接钱包
- 点击页面上的"连接钱包"按钮
- 在 MetaMask 中确认连接请求

### 2. 检查 ID NFT
- 系统自动检查用户是否拥有活跃的 ID NFT
- 如果有，直接登录成功
- 如果没有，弹出创建表单

### 3. 创建 ID NFT（如果需要）
- 填写酒吧基本信息
- 上传酒吧照片
- 提交表单创建 ID NFT

### 4. 完成登录
- ID NFT 创建成功后自动跳转到个人资料页面

## 文件结构

```
frontend/
├── assets/
│   ├── js/
│   │   ├── idnft-service.js      # ID NFT 服务类
│   │   └── idnft-modal.js        # 弹窗处理逻辑
│   └── css/
│       └── main.css              # 包含弹窗样式
├── components/
│   └── idnft-modal.html          # 弹窗 HTML 模板
├── pages/
│   ├── auth.html                 # 认证页面
│   └── config.html               # 配置页面
└── index.html                    # 主页面
```

## 技术实现

### ID NFT 服务类 (`idnft-service.js`)
- 处理与智能合约的交互
- 提供检查、创建 ID NFT 的方法
- 管理合约连接状态

### 弹窗处理 (`idnft-modal.js`)
- 管理弹窗的显示和隐藏
- 处理表单提交和图片上传
- 协调整个连接流程

### 元数据结构
ID NFT 的元数据包含以下信息：
```json
{
    "name": "酒吧名称",
    "description": "酒吧描述",
    "image": "IPFS图片URI",
    "attributes": [
        {"trait_type": "Bar Type", "value": "鸡尾酒吧"},
        {"trait_type": "Establishment Year", "value": "2020"},
        {"trait_type": "Country", "value": "中国"},
        {"trait_type": "City", "value": "上海"}
    ],
    "external_url": "官方网站",
    "social_media": {
        "instagram": "@yourbar",
        "website": "https://yourbar.com"
    },
    "contact": {
        "email": "contact@yourbar.com"
    }
}
```

## 注意事项

### 1. 合约权限
- `createIDNFT` 函数只能由合约所有者调用
- 在实际应用中，建议通过后端 API 来处理创建操作

### 2. IPFS 上传
- 当前实现使用模拟的 IPFS URI
- 需要集成真实的 IPFS 服务（如 Pinata、Infura IPFS 等）

### 3. 网络配置
- 确保 MetaMask 连接到正确的网络（Sepolia 测试网）
- 检查 RPC URL 配置是否正确

### 4. 错误处理
- 系统包含完整的错误处理机制
- 用户友好的错误提示

## 故障排除

### 常见问题

1. **"MetaMask 未找到"**
   - 确保已安装 MetaMask 浏览器扩展
   - 检查 MetaMask 是否已解锁

2. **"合约地址格式不正确"**
   - 检查合约地址是否为有效的以太坊地址格式
   - 确保地址以 `0x` 开头，长度为 42 字符

3. **"连接失败"**
   - 检查网络连接
   - 确保 MetaMask 连接到正确的网络
   - 检查 RPC URL 配置

4. **"创建 ID NFT 失败"**
   - 检查合约是否已正确部署
   - 确保合约地址配置正确
   - 检查用户是否有足够的 ETH 支付 gas 费用

### 调试技巧

1. 打开浏览器开发者工具查看控制台错误
2. 检查 MetaMask 的交易历史
3. 在 Etherscan 上查看合约交易记录

## 扩展功能

### 1. 真实 IPFS 集成
```javascript
// 在 idnft-modal.js 中替换模拟上传函数
async uploadImageToIPFS(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${PINATA_JWT_TOKEN}`
        },
        body: formData
    });
    
    const result = await response.json();
    return `ipfs://${result.IpfsHash}`;
}
```

### 2. 后端 API 集成
```javascript
// 通过后端 API 创建 ID NFT
async createIDNFT(metadataURI) {
    const response = await fetch('/api/idnft/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userAddress: this.userAddress,
            metadataURI: metadataURI
        })
    });
    
    return await response.json();
}
```

## 更新日志

- **v1.0.0**: 初始版本，支持基本的 ID NFT 检查和创建功能
- 支持 MetaMask 钱包连接
- 支持酒吧信息表单
- 支持图片上传（模拟）
- 支持智能合约交互

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个功能！

## 许可证

MIT License 