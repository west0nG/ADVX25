# Bars Help Bars - 产品需求文档

## 项目概述
**项目名称**: Bars Help Bars  
**项目类型**: Web3 酒吧生态系统  

## 功能模块一：NFT授权交易系统

### 1. 系统架构
本系统基于两个核心NFT构建：
- **ID NFT** (ERC 4907): 酒吧身份认证与授权管理
- **Recipe NFT** (ERC 4907): 鸡尾酒配方知识产权管理

### 2. 数据结构定义

#### 2.1 ID NFT 数据结构 (ERC 4907)
```json
{
  "metadata": {
    "mutable": true,
    "barPhoto": "String(URL)",
    "barName": "String", 
    "barLocation": "String",
    "barIntro": "String"
  }
}
```

#### 2.2 Recipe NFT 数据结构 (ERC 4907)
```json
{
  "metadata": {
    "mutable": false,
    "cocktailName": "String",
    "cocktailIntro": "String", 
    "cocktailPhoto": "String(URL)",
    "private": {
      "cocktailRecipe": "String",
      "recipePhoto": "String(URL)"
    }
  }
}
```
数据结构并非最终版本 仅供参考

### 3. 核心功能需求

#### 3.1 用户身份认证与ID NFT管理

**功能描述**: 用户通过MetaMask登录系统，系统验证用户是否持有ID NFT，如无则引导用户创建

**详细流程**:
1. **MetaMask连接验证**
   - 用户点击"连接钱包"按钮
   - 系统调用MetaMask API进行钱包连接
   - 验证连接状态和账户有效性

2. **ID NFT持有验证**
   - 系统查询用户钱包地址是否持有ID NFT
   - 检查ID NFT的有效性和所有权状态

3. **ID NFT创建流程** (如用户未持有)
   - 引导用户填写酒吧信息表单
   - 表单字段包括：酒吧照片、酒吧名称、位置、简介
   - 用户确认信息后，系统调用智能合约铸造ID NFT
   - 合约自动将ID NFT空投至用户钱包地址

**技术要求**:
- 支持MetaMask钱包连接
- 智能合约实现ERC 4907标准
- 前端表单验证与数据格式化
- Gas费用估算与用户确认

#### 3.2 Recipe NFT创建与铸造

**功能描述**: 酒吧用户可以创建并铸造自己的鸡尾酒配方NFT

**详细流程**:
1. **配方信息录入**
   - 用户填写鸡尾酒配方信息表单
   - 必填字段：鸡尾酒名称、简介、照片
   - 私有字段：详细配方、配方照片（仅授权用户可见）

2. **NFT铸造流程**
   - 系统验证表单数据完整性
   - 调用智能合约mint Recipe NFT
   - 合约自动将Recipe NFT空投给用户的ID NFT
   - ID NFT作为Recipe NFT的owner

**技术要求**:
- 表单数据验证与格式化
- 图片上传与IPFS存储
- 智能合约铸造逻辑
- 元数据标准化处理

#### 3.3 Recipe NFT定价与上架

**功能描述**: Recipe NFT持有者可以设置价格并将配方设置为可授权状态

**详细流程**:
1. **价格设置**
   - Recipe NFT owner选择要出售的Recipe NFT
   - 设置授权价格（USDT计价）
   - 确认价格设置

2. **上架操作**
   - 将Recipe NFT状态设置为"待出售"
   - 在市场中展示该Recipe NFT

**技术要求**:
- USDT价格设置与验证
- 市场展示界面
- 价格显示与格式化

#### 3.4 Recipe NFT授权购买

**功能描述**: 持有ID NFT的酒吧可以购买其他酒吧的Recipe NFT授权

**详细流程**:

1. **支付与授权**
   - 选择目标Recipe NFT
   - 用户通过MetaMask确认USDT支付
   - 智能合约验证支付金额
   - 合约将用户ID NFT添加到Recipe NFT的授权用户列表
   - 用户获得访问私有配方信息的权限

**技术要求**:
- USDT支付集成
- 智能合约授权逻辑
- 用户权限管理
- 交易状态跟踪

### 4. 用户界面需求
- 登陆界面
- 创建ID NFT界面
- 主界面
    - 包括左侧侧边栏和右侧recipe浏览
    - 左侧包括账户信息，My Recipe, My Bar, Create Recipe等功能
    - 右侧有市场浏览功能，页面仿照OpenSea
- 创建Recipe NFT界面
- 出售Recipe NFT使用权界面
- 购买Recipe NFT使用权界面

### 5. AI设计Bar
待处理 先不需要管 先实现其他功能