# 🧪 IDNFT 合约测试指南

本指南将帮助你测试 IDNFT 合约的所有功能。

## 📋 测试类型

### 1. 自动化测试 (推荐)
使用 Hardhat 的测试框架进行完整的自动化测试。

### 2. 手动测试
使用测试脚本进行交互式测试。

## 🚀 快速开始

### 安装依赖
```bash
cd contracts
npm install
```

### 编译合约
```bash
npm run compile
```

## 🧪 运行测试

### 自动化测试
```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx hardhat test test/IDNFT.test.js

# 运行测试并显示详细输出
npx hardhat test --verbose
```

### 手动测试
```bash
# 运行手动测试脚本
npm run test:manual
```

## 📊 测试覆盖范围

### ✅ 部署测试
- [x] 合约名称和符号设置
- [x] 合约所有者设置

### ✅ 创建ID NFT测试
- [x] 所有者创建NFT
- [x] 元数据正确存储
- [x] 地址映射建立
- [x] 权限控制
- [x] 输入验证
- [x] 重复创建检查
- [x] Token ID递增

### ✅ 查询功能测试
- [x] 检查用户是否有活跃NFT
- [x] 获取用户的Token ID
- [x] 获取Token的所有者
- [x] 获取总供应量
- [x] 获取Token URI

### ✅ 元数据更新测试
- [x] 所有者更新元数据
- [x] 权限控制
- [x] 状态检查
- [x] 输入验证
- [x] 事件触发

### ✅ 激活/停用测试
- [x] 停用NFT
- [x] 重新激活NFT
- [x] 权限控制
- [x] 状态检查
- [x] 事件触发

### ✅ ERC-6551特性测试
- [x] NFT不可转移
- [x] NFT不可批准
- [x] 不可设置操作员

### ✅ 边界情况测试
- [x] 大量NFT创建
- [x] 长URI处理
- [x] 错误处理

## 🔍 测试输出示例

### 自动化测试输出
```
  IDNFT Contract
    部署
      ✓ 应该正确设置合约名称和符号
      ✓ 应该正确设置合约所有者
    创建ID NFT
      ✓ 所有者应该能够为用户创建ID NFT
      ✓ 应该正确存储元数据
      ✓ 应该建立正确的地址映射
      ✓ 非所有者不能创建ID NFT
      ✓ 不能为无效地址创建ID NFT
      ✓ 不能为空URI创建ID NFT
      ✓ 同一地址不能拥有多个ID NFT
      ✓ 应该递增token ID
    查询功能
      ✓ 应该正确检查用户是否有活跃的ID NFT
      ✓ 应该正确获取用户的token ID
      ✓ 应该正确获取token的所有者地址
      ✓ 应该正确获取总供应量
      ✓ 应该正确获取token URI
    元数据更新
      ✓ NFT所有者应该能够更新元数据
      ✓ 非所有者不能更新元数据
      ✓ 不能更新不存在的token
      ✓ 不能更新停用的token
      ✓ 不能更新为空URI
      ✓ 更新应该触发事件
    激活/停用功能
      ✓ NFT所有者应该能够停用ID NFT
      ✓ NFT所有者应该能够重新激活ID NFT
      ✓ 非所有者不能停用ID NFT
      ✓ 非所有者不能重新激活ID NFT
      ✓ 不能停用已经停用的token
      ✓ 不能重新激活已经激活的token
      ✓ 停用应该触发事件
      ✓ 重新激活应该触发事件
    ERC-6551特性
      ✓ ID NFT不应该可以转移
      ✓ ID NFT不应该可以安全转移
      ✓ ID NFT不应该可以批准
      ✓ ID NFT不应该可以设置操作员
    边界情况
      ✓ 应该处理大量NFT的创建
      ✓ 应该正确处理长URI

  32 passing (3s)
```

### 手动测试输出
```
🚀 开始测试 IDNFT 合约...

👤 合约所有者: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
👤 测试用户1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
👤 测试用户2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
👤 测试用户3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906

📦 部署合约...
✅ 合约已部署到: 0x5FbDB2315678afecb367f032d93F642f64180aa3

🎯 测试1: 创建ID NFT
✅ 为用户1创建ID NFT成功
   Token ID: 1
   Token URI: ipfs://QmTestHash123
   交易哈希: 0x...

🔍 测试2: 查询功能
   用户1是否有活跃ID NFT: true
   用户1的Token ID: 1
   Token 1的所有者: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   总供应量: 1

📊 测试总结:
   ✅ 合约部署成功
   ✅ 创建了 3 个ID NFT
   ✅ 所有查询功能正常
   ✅ 元数据更新功能正常
   ✅ 激活/停用功能正常
   ✅ 错误处理正确
   ✅ ERC-6551特性正确实现

🎉 所有测试通过！合约功能正常。
```

## 🐛 调试技巧

### 查看详细错误信息
```bash
# 显示详细错误信息
npx hardhat test --verbose

# 显示gas使用情况
REPORT_GAS=true npx hardhat test
```

### 调试特定测试
```bash
# 只运行特定测试
npx hardhat test --grep "创建ID NFT"

# 跳过某些测试
npx hardhat test --grep "边界情况" --invert
```

### 查看合约状态
```javascript
// 在测试中添加调试信息
console.log("合约地址:", idnft.address);
console.log("所有者:", await idnft.owner());
console.log("总供应量:", await idnft.totalSupply());
```

## 🔧 常见问题

### Q: 测试失败怎么办？
A: 检查以下几点：
1. 确保所有依赖已安装
2. 确保合约已编译
3. 检查Hardhat配置
4. 查看详细错误信息

### Q: Gas费用过高？
A: 合约已优化为只存储IPFS URI，gas费用应该很低。

### Q: 如何测试特定网络？
A: 使用 `--network` 参数：
```bash
npx hardhat test --network sepolia
```

## 📈 性能测试

### Gas使用情况
```bash
# 启用gas报告
REPORT_GAS=true npx hardhat test
```

### 预期Gas消耗
- 创建ID NFT: ~300,000 gas
- 更新元数据: ~50,000 gas
- 停用/激活: ~30,000 gas
- 查询操作: ~0 gas (view函数)

## 🎯 下一步

测试通过后，你可以：
1. 部署到测试网络
2. 集成到后端API
3. 开发前端界面
4. 部署到主网

---

**注意**: 在生产环境部署前，请确保所有测试都通过！ 