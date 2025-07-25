# CA4 快速开始指南

## 快速部署

### 1. 安装依赖
```bash
cd contracts/CA4
npm install
```

### 2. 配置环境
```bash
cp env.example .env
# 编辑.env文件，填入你的私钥和网络配置
```

### 3. 本地测试
```bash
# 编译合约
npm run compile

# 运行测试
npm test

# 本地部署
npm run deploy
```

### 4. Sepolia测试网部署
```bash
# 确保.env文件配置正确
npm run deploy-sepolia
```

## 核心功能演示

### 购买Recipe授权
```javascript
// 1. 用户授权USDT
await usdtToken.approve(marketplace.address, price);

// 2. 购买授权
await marketplace.purchaseAuthorization(recipeTokenId, 0);
```

### 查询功能
```javascript
// 获取可购买的Recipe列表
const availableRecipes = await marketplace.getAvailableRecipes();

// 获取Recipe详细信息
const details = await marketplace.getRecipeDetails(recipeTokenId);

// 检查访问权限
const hasAccess = await marketplace.hasAccessToRecipe(recipeTokenId, userAddress);
```

## 合约地址配置

部署完成后，需要更新以下地址：
- `USDT_ADDRESS`: USDT代币合约地址
- `IDNFT_ADDRESS`: ID NFT合约地址  
- `RECIPE_NFT_ADDRESS`: Recipe NFT合约地址

## 常见问题

### Q: 如何修改平台费用比例？
A: 只有合约所有者可以调用 `updatePlatformFeeRate()` 函数

### Q: 如何暂停合约？
A: 合约所有者可以调用 `pause()` 函数紧急暂停

### Q: 如何提取平台费用？
A: 合约所有者可以调用 `emergencyWithdrawUSDT()` 函数

## 技术支持

如有问题，请查看：
- [完整文档](README.md)
- [测试文件](test/RecipeMarketplace.test.js)
- [部署脚本](scripts/) 