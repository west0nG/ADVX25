# Recipe NFT ERC-6551 集成指南

## 📋 **修改概述**

根据您的要求，Recipe NFT现在只能铸造于和存在于ID NFT的ERC-6551账户里。这个修改实现了以下目标：

### ✅ **主要变更**

1. **铸造权限限制**：只有拥有活跃ID NFT的用户才能铸造Recipe NFT
2. **所有权转移**：Recipe NFT直接铸造到ID NFT的ERC-6551账户地址
3. **权限管理**：所有Recipe NFT的管理操作只能由对应的ERC-6551账户执行
4. **关联关系**：Recipe NFT与ID NFT建立了明确的关联关系

---

## 🏗️ **合约架构变更**

### **Recipe NFT合约修改**

#### **1. 新增接口和依赖**
```solidity
// ID NFT合约接口
interface IIDNFT {
    function getAccountAddress(uint256 tokenId) external view returns (address);
    function hasActiveIDNFT(address user) external view returns (bool);
    function getTokenIdByAddress(address user) external view returns (uint256);
}

// ID NFT合约地址
IIDNFT public idnftContract;
```

#### **2. 构造函数修改**
```solidity
constructor(string memory name, string memory symbol, address _idnftContract)
    ERC721(name, symbol)
    Ownable(msg.sender)
{
    require(_idnftContract != address(0), "RecipeNFT: Invalid ID NFT contract address");
    idnftContract = IIDNFT(_idnftContract);
}
```

#### **3. 元数据结构扩展**
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

#### **4. 新增映射关系**
```solidity
// ID NFT tokenId => Recipe tokenIds (用于查询ID NFT拥有的Recipe)
mapping(uint256 => uint256[]) public idNFTToRecipeTokens;
```

---

## 🎯 **铸造逻辑变更**

### **新的铸造流程**

```solidity
function mintRecipeNFT(string memory uri) external onlyIDNFTHolder returns (uint256) {
    require(bytes(uri).length > 0, "RecipeNFT: Token URI cannot be empty");
    
    // 1. 获取用户的ID NFT token ID
    uint256 idNFTTokenId = idnftContract.getTokenIdByAddress(msg.sender);
    require(idNFTTokenId > 0, "RecipeNFT: User has no ID NFT");
    
    // 2. 获取ID NFT的ERC-6551账户地址
    address idNFTAccount = idnftContract.getAccountAddress(idNFTTokenId);
    require(idNFTAccount != address(0), "RecipeNFT: Invalid ID NFT account");
    
    _tokenIds++;
    uint256 newTokenId = _tokenIds;
    
    // 3. 铸造到ERC-6551账户
    _safeMint(idNFTAccount, newTokenId);
    _setTokenURI(newTokenId, uri);
    
    // 4. 创建元数据并建立关联关系
    recipeMetadata[newTokenId] = RecipeMetadata({
        tokenURI: uri,
        isActive: true,
        createdAt: block.timestamp,
        updatedAt: block.timestamp,
        price: 0,
        isForSale: false,
        idNFTTokenId: idNFTTokenId,
        idNFTAccount: idNFTAccount
    });
    
    // 5. 更新映射关系
    ownerToTokenIds[idNFTAccount].push(newTokenId);
    idNFTToRecipeTokens[idNFTTokenId].push(newTokenId);
    
    emit RecipeNFTCreated(newTokenId, idNFTAccount, idNFTTokenId, uri);
    return newTokenId;
}
```

### **权限检查**

```solidity
modifier onlyIDNFTHolder() {
    require(idnftContract.hasActiveIDNFT(msg.sender), "RecipeNFT: User must have active ID NFT");
    _;
}

modifier onlyIDNFTAccount(uint256 tokenId) {
    require(msg.sender == recipeMetadata[tokenId].idNFTAccount, "RecipeNFT: Not the ID NFT account");
    _;
}
```

---

## 🔧 **管理操作变更**

### **权限转移**

所有Recipe NFT的管理操作现在只能由对应的ERC-6551账户执行：

#### **1. 更新元数据**
```solidity
function updateTokenURI(uint256 tokenId, string memory newURI) 
    external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId)
```

#### **2. 设置价格**
```solidity
function setPrice(uint256 tokenId, uint256 price) 
    external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId)
```

#### **3. 设置授权状态**
```solidity
function setSaleStatus(uint256 tokenId, bool isForSale) 
    external onlyIDNFTAccount(tokenId) onlyActiveToken(tokenId)
```

#### **4. 用户授权管理**
```solidity
function setUser(uint256 tokenId, address user, uint64 expires) 
    external onlyIDNFTAccount(tokenId)

function removeUser(uint256 tokenId) 
    external onlyIDNFTAccount(tokenId)
```

---

## 📊 **查询功能增强**

### **新增查询函数**

#### **1. 获取ID NFT拥有的Recipe**
```solidity
function getRecipeTokensByIDNFT(uint256 idNFTTokenId) 
    external view returns (uint256[] memory)
```

#### **2. 获取用户通过ID NFT拥有的Recipe**
```solidity
function getRecipeTokensByUser(address user) 
    external view returns (uint256[] memory)
```

#### **3. 扩展的元数据查询**
```solidity
function getRecipeMetadata(uint256 tokenId) external view returns (
    string memory uri,
    bool isActive,
    uint256 createdAt,
    uint256 updatedAt,
    uint256 price,
    bool isForSale,
    uint256 idNFTTokenId,
    address idNFTAccount
)
```

---

## 🚀 **部署流程变更**

### **CA2 独立部署**

```bash
# 部署包含ID NFT的完整CA2系统
cd contracts/CA2
npm run deploy:injective-with-idnft
```

### **CA4 完整部署**

```bash
# 部署完整的CA4市场系统
cd contracts/CA4
npm run deploy:injective
```

### **CA4 重用部署**

```bash
# 重用已部署的CA1和CA2合约
cd contracts/CA4
npm run deploy:injective-reuse
```

---

## 🔄 **使用流程**

### **1. 用户注册流程**
```javascript
// 1. 管理员为用户创建ID NFT
const createIDTx = await idnftContract.createIDNFT(userAddress, idnftURI);
await createIDTx.wait();

// 2. 用户获得ERC-6551账户地址
const idNFTTokenId = await idnftContract.getTokenIdByAddress(userAddress);
const erc6551Account = await idnftContract.getAccountAddress(idNFTTokenId);
```

### **2. Recipe NFT创建流程**
```javascript
// 1. 用户铸造Recipe NFT（自动铸造到ERC-6551账户）
const mintRecipeTx = await recipeNFTContract.mintRecipeNFT(recipeURI);
await mintRecipeTx.wait();

// 2. Recipe NFT现在属于ERC-6551账户
const tokenId = 1; // 假设铸造的token ID
const metadata = await recipeNFTContract.recipeMetadata(tokenId);
console.log("Recipe NFT所有者:", metadata.idNFTAccount);
```

### **3. Recipe NFT管理流程**
```javascript
// 注意：这些操作现在需要从ERC-6551账户执行
// 需要通过ERC-6551账户的签名来执行

// 设置价格
const setPriceTx = await recipeNFTContract.setPrice(tokenId, price);
await setPriceTx.wait();

// 设置为可授权
const setSaleTx = await recipeNFTContract.setSaleStatus(tokenId, true);
await setSaleTx.wait();
```

---

## ⚠️ **重要注意事项**

### **1. 权限管理**
- Recipe NFT的所有管理操作现在只能由ERC-6551账户执行
- 用户需要通过ERC-6551账户的签名来管理Recipe NFT
- 这增加了安全性，但也增加了操作复杂性

### **2. 部署顺序**
- 必须先部署ID NFT合约
- 然后部署Recipe NFT合约，并传入ID NFT合约地址
- 最后部署Marketplace合约

### **3. 兼容性**
- 现有的Recipe NFT（如果已部署）需要重新部署
- 新的铸造逻辑与ERC-6551标准完全兼容
- Marketplace合约需要相应更新以处理新的权限模型

### **4. Gas成本**
- 铸造Recipe NFT现在需要额外的gas来查询ID NFT信息
- 管理操作需要从ERC-6551账户执行，可能增加gas成本

---

## 🎯 **优势**

### **1. 安全性提升**
- Recipe NFT与ID NFT强绑定
- 只有经过身份验证的用户才能创建Recipe NFT
- 管理权限集中在ERC-6551账户

### **2. 身份验证**
- 确保Recipe NFT创建者都有有效的ID NFT
- 建立清晰的用户身份体系
- 便于后续的治理和权限管理

### **3. 资产隔离**
- Recipe NFT存储在ERC-6551账户中
- 与用户的EOA地址分离
- 支持更复杂的资产管理策略

### **4. 可扩展性**
- 为未来的功能扩展奠定基础
- 支持ERC-6551生态系统的其他功能
- 便于集成其他DeFi协议

---

## 📝 **总结**

这次修改实现了Recipe NFT与ID NFT的深度集成，通过ERC-6551标准建立了强关联关系。虽然增加了操作复杂性，但显著提升了系统的安全性和可扩展性。

主要变化：
- ✅ Recipe NFT只能由ID NFT持有者铸造
- ✅ Recipe NFT直接存储在ERC-6551账户中
- ✅ 所有管理操作需要ERC-6551账户权限
- ✅ 建立了完整的关联关系映射
- ✅ 增强了查询和管理功能

这个架构为Bars Help Bars项目提供了一个更加安全和可扩展的Recipe NFT管理系统。 