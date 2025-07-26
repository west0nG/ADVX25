# Injective 测试网合约文档 - CA4 完整市场系统

本文档详细说明了部署在Injective测试网上的CA4完整市场系统的智能合约数据结构、调用方法和交互流程。

## 📋 合约概览

### 已部署合约地址 (CA4)

| 合约名称 | 地址 | 说明 |
|---------|------|------|
| **MockUSDT** | `0x81DDAf3D421BD54EdeBdE08C00EF59dA2464b927` | 模拟USDT代币合约 |
| **IDNFT6551** | `0xc4971cd7ef0fC14bd3b3Af97ECC85A298475B4Ff` | 酒吧身份NFT合约 (ERC-6551) |
| **RecipeNFT** | `0x2AF8d627E7767411093163a8a2bCfEd581f8E98b` | 鸡尾酒配方NFT合约 (ERC-4907) |
| **RecipeMarketplace** | `0x03bEdd3242b625a8Ce602137314901D77Bc26503` | Recipe NFT授权购买市场 |

### 网络信息
- **网络名称**: Injective Testnet
- **Chain ID**: 1439
- **RPC URL**: `https://clean-cool-dust.injective-testnet.quiknode.pro/f2dcf86a3537602a3470aa71713305c63797504d`
- **区块浏览器**: https://testnet.explorer.injective.network/
- **部署者地址**: `0xffEa650e76B756aBAb614CC0143210eEB7813Bea`

---

## 💰 MockUSDT 合约

### 合约信息
- **标准**: ERC-20
- **功能**: 模拟USDT代币，用于测试市场支付
- **小数位数**: 6位 (与真实USDT一致)
- **地址**: `0x81DDAf3D421BD54EdeBdE08C00EF59dA2464b927`

### 数据结构

#### 状态变量
```solidity
uint8 private _decimals = 6;  // USDT使用6位小数
```

### 主要函数

#### 1. 铸造代币
```solidity
function mint(address to, uint256 amount) external onlyOwner
```
**参数**:
- `to`: 接收地址
- `amount`: 铸造金额 (6位小数)

**权限**: 仅合约所有者

**示例调用**:
```javascript
const amount = ethers.parseUnits("10000", 6); // 10,000 USDT
const tx = await mockUSDTContract.mint(deployer.address, amount);
await tx.wait();
```

#### 2. 销毁代币
```solidity
function burn(address from, uint256 amount) external onlyOwner
```
**参数**:
- `from`: 销毁地址
- `amount`: 销毁金额

**权限**: 仅合约所有者

#### 3. 查询函数

##### 获取代币小数位数
```solidity
function decimals() public view virtual override returns (uint8)
```

##### 获取代币名称
```solidity
function name() public view virtual override returns (string memory)
```

##### 获取代币符号
```solidity
function symbol() public view virtual override returns (string memory)
```

##### 查询余额
```solidity
function balanceOf(address account) public view virtual override returns (uint256)
```

#### 4. 标准ERC-20函数
- `transfer(address to, uint256 amount)`
- `transferFrom(address from, address to, uint256 amount)`
- `approve(address spender, uint256 amount)`
- `allowance(address owner, address spender)`

---

## 🏪 IDNFT6551 合约

### 合约信息
- **标准**: ERC-6551 (Token Bound Account)
- **功能**: 酒吧身份认证与授权管理
- **特点**: 每个ID NFT都有独立的ERC-6551账户地址
- **地址**: `0xc4971cd7ef0fC14bd3b3Af97ECC85A298475B4Ff`

### 数据结构

#### IDMetadata 结构
```solidity
struct IDMetadata {
    string tokenURI;      // IPFS metadata URI
    bool isActive;        // 是否激活
    uint256 createdAt;    // 创建时间
    uint256 updatedAt;    // 更新时间
    address accountAddress; // ERC-6551账户地址
}
```

#### 状态变量
```solidity
uint256 private _tokenIds;                                    // 当前token数量
mapping(uint256 => IDMetadata) public idMetadata;            // tokenId => 元数据
mapping(address => uint256) public addressToTokenId;         // 地址 => tokenId
mapping(uint256 => address) public tokenIdToAddress;         // tokenId => 地址
mapping(address => uint256) public accountToTokenId;         // ERC-6551账户 => tokenId
```

### 主要函数

#### 1. 创建ID NFT
```solidity
function createIDNFT(address to, string memory uri) external onlyOwner returns (uint256)
```
**参数**:
- `to`: 接收者地址
- `uri`: IPFS元数据URI

**返回值**: 新创建的token ID

**权限**: 仅合约所有者

**示例调用**:
```javascript
const tx = await idnftContract.createIDNFT(
    "0x1234567890123456789012345678901234567890",
    "ipfs://QmTestIDNFT123456789"
);
await tx.wait();
```

#### 2. 更新元数据
```solidity
function updateMetadata(uint256 tokenId, string memory uri) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId)
```
**参数**:
- `tokenId`: NFT的token ID
- `uri`: 新的IPFS元数据URI

**权限**: 仅token拥有者，且token必须激活

#### 3. 查询函数

##### 获取身份元数据
```solidity
function getIDMetadata(uint256 tokenId) external view returns (IDMetadata memory)
```

##### 获取ERC-6551账户地址
```solidity
function getAccountAddress(uint256 tokenId) external view returns (address)
```

##### 检查用户是否有活跃ID NFT
```solidity
function hasActiveIDNFT(address user) external view returns (bool)
```

##### 获取用户的token ID
```solidity
function getTokenIdByAddress(address user) external view returns (uint256)
```

##### 通过账户地址获取tokenId
```solidity
function getTokenIdByAccount(address accountAddress) external view returns (uint256)
```

#### 4. 状态管理

##### 停用ID NFT
```solidity
function deactivateIDNFT(uint256 tokenId) external onlyTokenOwner(tokenId) onlyActiveToken(tokenId)
```

##### 重新激活ID NFT
```solidity
function reactivateIDNFT(uint256 tokenId) external onlyTokenOwner(tokenId)
```

### 事件
```solidity
event IDNFTCreated(uint256 indexed tokenId, address indexed owner, address indexed accountAddress, string tokenURI);
event MetadataUpdated(uint256 indexed tokenId, string tokenURI);
event IDNFTDeactivated(uint256 indexed tokenId);
event IDNFTReactivated(uint256 indexed tokenId);
event AccountCreated(uint256 indexed tokenId, address indexed accountAddress);
```

---

## 🍹 RecipeNFT 合约

### 合约信息
- **标准**: ERC-4907 (Rentable NFTs)
- **功能**: 鸡尾酒配方NFT，支持临时用户授权
- **特点**: 只能铸造到ID NFT的ERC-6551账户中
- **地址**: `0x2AF8d627E7767411093163a8a2bCfEd581f8E98b`

### 数据结构

#### UserInfo 结构 (ERC-4907)
```solidity
struct UserInfo {
    address user;     // 授权用户地址
    uint64 expires;   // 授权过期时间
}
```

#### RecipeMetadata 结构
```solidity
struct RecipeMetadata {
    string tokenURI;      // IPFS metadata URI
    bool isActive;        // 是否激活
    uint256 createdAt;    // 创建时间
    uint256 updatedAt;    // 更新时间
    uint256 price;        // 授权价格 (USDT, 以wei为单位)
    bool isForSale;       // 是否可授权
    uint256 idNFTTokenId; // 关联的ID NFT token ID
    address idNFTAccount; // ID NFT的ERC-6551账户地址
}
```

#### 状态变量
```solidity
uint256 private _tokenIds;                                    // 当前token数量
mapping(uint256 => RecipeMetadata) public recipeMetadata;    // tokenId => 元数据
mapping(uint256 => UserInfo) internal _users;                // tokenId => 用户信息
mapping(address => uint256[]) public ownerToTokenIds;        // owner => tokenIds
mapping(address => uint256[]) public userToAuthorizedTokenIds; // 授权用户 => tokenIds
mapping(uint256 => uint256[]) public idNFTToRecipeTokens;    // ID NFT tokenId => Recipe tokenIds
```

### 主要函数

#### 1. 铸造Recipe NFT
```solidity
function mintRecipeNFT(string memory uri) external onlyIDNFTHolder returns (uint256)
```
**参数**:
- `uri`: IPFS元数据URI

**返回值**: 新创建的token ID

**权限**: 用户必须有活跃的ID NFT

**示例调用**:
```javascript
const tx = await recipeNFTContract.mintRecipeNFT("ipfs://QmTestRecipe123456789");
await tx.wait();
```

#### 2. 更新元数据
```solidity
function updateTokenURI(uint256 tokenId, string memory newURI) external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId)
```
**参数**:
- `tokenId`: NFT的token ID
- `newURI`: 新的IPFS元数据URI

**权限**: 仅ID NFT账户，且token必须激活

#### 3. 价格和销售状态管理

##### 设置授权价格
```solidity
function setPrice(uint256 tokenId, uint256 price) external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId)
```
**参数**:
- `tokenId`: NFT的token ID
- `price`: 授权价格 (USDT, 以wei为单位)

##### 设置销售状态
```solidity
function setSaleStatus(uint256 tokenId, bool isForSale) external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId)
```
**参数**:
- `tokenId`: NFT的token ID
- `isForSale`: 是否可授权

#### 4. ERC-4907 用户授权

##### 设置用户授权
```solidity
function setUser(uint256 tokenId, address user, uint64 expires) external onlyIDNFTAccount(tokenId)
```
**参数**:
- `tokenId`: NFT的token ID
- `user`: 授权用户地址
- `expires`: 授权过期时间

**权限**: 仅ID NFT账户，且token必须可授权

##### 移除用户授权
```solidity
function removeUser(uint256 tokenId) external onlyIDNFTAccount(tokenId)
```

##### 获取用户信息 (ERC-4907)
```solidity
function userOf(uint256 tokenId) external view returns (address user, uint64 expires)
```

##### 检查访问权限
```solidity
function hasAccess(uint256 tokenId, address user) external view returns (bool hasAccess)
```

#### 5. 查询函数

##### 获取Recipe元数据
```solidity
function getRecipeMetadata(uint256 tokenId) external view returns (string, bool, uint256, uint256, uint256, bool, uint256, address)
```

##### 获取可授权的Recipe NFT
```solidity
function getForSaleTokens() external view returns (uint256[] memory)
```

##### 获取ID NFT拥有的Recipe tokenIds
```solidity
function getRecipeTokensByIDNFT(uint256 idNFTTokenId) external view returns (uint256[] memory)
```

##### 获取用户通过ID NFT拥有的Recipe tokenIds
```solidity
function getRecipeTokensByUser(address user) external view returns (uint256[] memory)
```

#### 6. Marketplace集成

##### 允许Marketplace设置用户授权
```solidity
function setUserByMarketplace(uint256 tokenId, address user, uint64 expires) external
```

### 事件
```solidity
event RecipeNFTCreated(uint256 indexed tokenId, address indexed owner, uint256 indexed idNFTTokenId, string tokenURI);
event RecipeMetadataUpdated(uint256 indexed tokenId, string newTokenURI);
event UserUpdated(uint256 indexed tokenId, address indexed user, uint64 expires);
event PriceSet(uint256 indexed tokenId, uint256 price);
event SaleStatusChanged(uint256 indexed tokenId, bool isForSale);
```

---

## 🏪 RecipeMarketplace 合约

### 合约信息
- **功能**: Recipe NFT授权购买市场
- **支付方式**: USDT
- **平台费用**: 2.5%
- **默认授权期限**: 365天
- **地址**: `0x03bEdd3242b625a8Ce602137314901D77Bc26503`

### 数据结构

#### Transaction 结构
```solidity
struct Transaction {
    uint256 transactionId;        // 交易ID
    uint256 recipeTokenId;        // Recipe NFT的token ID
    address buyer;                // 买家地址
    address seller;               // 卖家地址
    uint256 price;                // 价格
    uint256 platformFee;          // 平台费用
    uint256 sellerAmount;         // 卖家应得金额
    uint64 authorizationExpires;  // 授权过期时间
    bool isCompleted;             // 是否完成
    uint256 timestamp;            // 时间戳
}
```

#### 状态变量
```solidity
uint256 private _transactionIds;                              // 交易ID计数器
IERC20 public usdtToken;                                      // USDT合约地址
IIDNFT public idnftContract;                                  // IDNFT合约地址
IRecipeNFT public recipeNFTContract;                         // RecipeNFT合约地址
uint256 public platformFeeRate = 250;                        // 平台费用比例 (基点: 2.5%)
uint64 public defaultAuthorizationDuration = 365 days;       // 默认授权期限
mapping(uint256 => Transaction) public transactions;         // 交易记录
mapping(address => uint256[]) public userTransactions;      // 用户交易记录
mapping(uint256 => uint256[]) public recipeTransactions;    // Recipe交易记录
```

### 主要函数

#### 1. 购买Recipe授权
```solidity
function purchaseRecipeAuthorization(uint256 recipeTokenId) external nonReentrant whenNotPaused onlyIDNFTHolder(msg.sender) validRecipe(recipeTokenId)
```
**参数**:
- `recipeTokenId`: Recipe NFT的token ID

**权限**: 用户必须有活跃的ID NFT

**示例调用**:
```javascript
const tx = await marketplaceContract.purchaseRecipeAuthorization(1);
await tx.wait();
```

#### 2. 查询函数

##### 获取交易记录
```solidity
function getTransaction(uint256 transactionId) external view returns (Transaction memory)
```

##### 获取用户的交易记录
```solidity
function getUserTransactions(address user) external view returns (uint256[] memory)
```

##### 获取Recipe的交易记录
```solidity
function getRecipeTransactions(uint256 recipeTokenId) external view returns (uint256[] memory)
```

##### 检查用户是否有权限访问Recipe
```solidity
function hasAccessToRecipe(uint256 recipeTokenId, address user) external view returns (bool)
```

##### 获取Recipe的授权信息
```solidity
function getRecipeAuthorization(uint256 recipeTokenId) external view returns (address user, uint64 expires)
```

##### 获取可购买的Recipe列表
```solidity
function getAvailableRecipes() external view returns (uint256[] memory)
```

##### 获取Recipe的详细信息
```solidity
function getRecipeDetails(uint256 recipeTokenId) external view returns (string memory uri, bool isActive, uint256 price, bool isForSale)
```

#### 3. 管理函数

##### 更新平台费用比例
```solidity
function updatePlatformFeeRate(uint256 newRate) external onlyOwner
```
**参数**:
- `newRate`: 新的平台费用比例 (基点)

##### 更新授权期限
```solidity
function updateAuthorizationDuration(uint64 newDuration) external onlyOwner
```
**参数**:
- `newDuration`: 新的授权期限 (秒)

##### 暂停合约
```solidity
function pause() external onlyOwner
```

##### 恢复合约
```solidity
function unpause() external onlyOwner
```

##### 紧急提款
```solidity
function emergencyWithdraw(address token, address to, uint256 amount) external onlyOwner
```

### 事件
```solidity
event TransactionCreated(uint256 indexed transactionId, uint256 indexed recipeTokenId, address indexed buyer, address seller, uint256 price, uint256 platformFee);
event TransactionCompleted(uint256 indexed transactionId, uint256 indexed recipeTokenId, address indexed buyer, uint64 authorizationExpires);
event TransactionCancelled(uint256 indexed transactionId, uint256 indexed recipeTokenId, address indexed buyer);
event PlatformFeeRateUpdated(uint256 oldRate, uint256 newRate);
event AuthorizationDurationUpdated(uint64 oldDuration, uint64 newDuration);
event EmergencyWithdraw(address indexed token, address indexed to, uint256 amount);
```

---

## 🔗 合约交互流程

### 1. 用户注册流程
1. 合约所有者调用 `IDNFT6551.createIDNFT()` 为用户创建身份NFT
2. 系统自动创建ERC-6551账户地址
3. 用户获得酒吧身份认证

### 2. Recipe NFT创建流程
1. 用户调用 `RecipeNFT.mintRecipeNFT()` 铸造Recipe NFT
2. Recipe NFT自动铸造到用户ID NFT的ERC-6551账户中
3. 设置Recipe的元数据、价格和销售状态

### 3. 购买授权流程
1. 买家调用 `RecipeMarketplace.purchaseRecipeAuthorization()`
2. 系统验证买家是否有ID NFT
3. 自动转移USDT支付费用（包括平台费用）
4. 自动设置用户授权到Recipe NFT
5. 记录完整的交易信息

### 4. 访问Recipe流程
1. 用户调用 `RecipeNFT.hasAccess()` 检查访问权限
2. 如果授权有效，用户可以访问Recipe的私有配方信息

---

## 📊 测试数据

### 当前测试状态
- **USDT余额**: 10,000 USDT (已铸造到部署者账户)
- **ID NFT**: 已创建 (Token ID: 1)
- **Recipe NFT**: 已创建 (Token ID: 1)
- **授权状态**: 已设置为可授权，价格 10 USDT

### 测试账户
- **部署者**: `0xffEa650e76B756aBAb614CC0143210eEB7813Bea`
- **测试用户**: `0x1234567890123456789012345678901234567890`

---

## 🚨 注意事项

1. **权限控制**: 确保调用函数时使用正确的账户权限
2. **Gas费用**: 所有操作都需要支付INJ作为gas费用
3. **时间戳**: 授权过期时间必须大于当前时间戳
4. **价格单位**: USDT价格以wei为单位（6位小数）
5. **合约依赖**: RecipeMarketplace依赖其他三个合约正常工作
6. **ERC-6551账户**: 每个ID NFT都有独立的账户地址，Recipe NFT只能铸造到这些账户中

---

## 🔗 相关链接

- [Injective 官方文档](https://docs.injective.network/)
- [Injective 测试网水龙头](https://testnet.faucet.injective.network/)
- [Injective 测试网区块浏览器](https://testnet.explorer.injective.network/)
- [ERC-4907 标准](https://eips.ethereum.org/EIPS/eip-4907)
- [ERC-6551 标准](https://eips.ethereum.org/EIPS/eip-6551)
