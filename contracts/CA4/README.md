# CA4 - Recipe NFT授权购买市场合约

## 概述

CA4合约实现了Recipe NFT的授权购买功能，是Bars Help Bars项目的核心交易合约。该合约负责处理USDT支付、授权管理和交易记录。

## 功能特性

### 核心功能
- **Recipe NFT授权购买**: 持有ID NFT的酒吧可以购买其他酒吧的Recipe NFT授权
- **USDT支付集成**: 支持USDT代币支付，自动处理平台费用分配
- **授权管理**: 基于ERC-4907标准实现临时用户授权
- **交易记录**: 完整的交易历史记录和查询功能

### 安全特性
- **重入攻击防护**: 使用ReentrancyGuard防止重入攻击
- **暂停机制**: 支持紧急暂停和恢复
- **权限控制**: 严格的访问控制和管理员功能
- **输入验证**: 全面的参数验证和错误处理

## 合约架构

### 主要合约
- `RecipeMarketplace.sol`: 主要的市场合约
- `MockUSDT.sol`: 模拟USDT合约（用于测试）

### 接口文件
- `IERC20.sol`: ERC20代币接口
- `IIDNFT.sol`: ID NFT合约接口
- `IRecipeNFT.sol`: Recipe NFT合约接口

## 部署指南

### 环境准备
1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
```bash
cp env.example .env
# 编辑.env文件，填入必要的配置信息
```

### 本地部署
```bash
# 编译合约
npm run compile

# 本地部署（包含模拟合约）
npm run deploy
```

### Sepolia测试网部署
```bash
# 确保已配置.env文件中的网络信息
npm run deploy-sepolia
```

## 测试

### 运行测试
```bash
npm test
```

### 测试覆盖
- 合约部署验证
- 授权购买流程
- 权限控制
- 管理员功能
- 事件触发
- 错误处理

## 合约接口

### 主要函数

#### 购买授权
```solidity
function purchaseAuthorization(
    uint256 recipeTokenId,
    uint64 authorizationDuration
) external
```

#### 查询功能
```solidity
function getAvailableRecipes() external view returns (uint256[] memory)
function getRecipeDetails(uint256 recipeTokenId) external view returns (...)
function hasAccessToRecipe(uint256 recipeTokenId, address user) external view returns (bool)
function getTransaction(uint256 transactionId) external view returns (Transaction memory)
```

#### 管理员功能
```solidity
function updatePlatformFeeRate(uint256 newRate) external
function updateAuthorizationDuration(uint64 newDuration) external
function pause() external
function unpause() external
function emergencyWithdrawUSDT(address to, uint256 amount) external
```

## 交易流程

### 1. 准备阶段
- 买家必须持有有效的ID NFT
- Recipe NFT必须处于可授权状态
- 买家需要足够的USDT余额和授权

### 2. 购买流程
1. 买家调用`purchaseAuthorization`函数
2. 合约验证所有条件
3. 转移USDT（扣除平台费用）
4. 设置Recipe NFT的授权用户
5. 创建交易记录
6. 触发相关事件

### 3. 授权管理
- 授权期限默认为365天
- 支持自定义授权期限
- 基于ERC-4907标准实现

## 费用结构

### 平台费用
- 默认费率: 2.5% (250基点)
- 最大费率: 10% (1000基点)
- 费用分配: 平台保留，卖家获得剩余金额

### 费用计算
```solidity
platformFee = price * platformFeeRate / 10000
sellerAmount = price - platformFee
```

## 安全考虑

### 重入攻击防护
- 使用OpenZeppelin的ReentrancyGuard
- 状态更新在外部调用之前

### 权限控制
- 只有ID NFT持有者可以购买授权
- 只有Recipe所有者可以设置价格和状态
- 只有合约所有者可以执行管理功能

### 输入验证
- 地址有效性检查
- 价格和金额验证
- 时间戳验证

## 事件系统

### 主要事件
- `TransactionCreated`: 交易创建
- `TransactionCompleted`: 交易完成
- `PlatformFeeRateUpdated`: 平台费用更新
- `AuthorizationDurationUpdated`: 授权期限更新
- `EmergencyWithdraw`: 紧急提取

## 错误处理

### 常见错误
- `Marketplace: User must have active ID NFT`
- `Marketplace: Recipe is not for sale`
- `Marketplace: Insufficient USDT balance`
- `Marketplace: Cannot purchase own recipe`

## 集成指南

### 前端集成
1. 连接MetaMask钱包
2. 检查用户ID NFT状态
3. 获取可购买的Recipe列表
4. 处理USDT授权
5. 调用购买函数
6. 监听交易事件

### 后端集成
1. 监听合约事件
2. 更新数据库记录
3. 处理IPFS元数据
4. 提供API接口

## 维护和升级

### 合约升级
- 当前版本不支持代理升级
- 需要重新部署合约
- 建议使用代理模式进行未来升级

### 监控建议
- 监控交易成功率
- 跟踪平台费用收入
- 监控异常交易模式
- 定期检查合约余额

## 许可证

MIT License 