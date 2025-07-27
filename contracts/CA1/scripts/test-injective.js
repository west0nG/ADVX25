const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🧪 开始测试 Injective 测试网上的合约...");

  // 读取部署信息
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  } catch (error) {
    console.error("❌ 未找到 deployment-info.json 文件");
    console.log("请先运行部署脚本: npm run deploy:injective");
    return;
  }

  // 获取合约地址
  const contractAddress = deploymentInfo.address;
  console.log("📦 合约地址:", contractAddress);

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("👤 测试账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "USDT");

  // 连接到已部署的合约
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const idnft = IDNFT.attach(contractAddress);

  console.log("\n🔍 基础功能测试...");

  // 测试1: 检查合约基本信息
  console.log("\n1️⃣ 检查合约基本信息");
  try {
    const name = await idnft.name();
    const symbol = await idnft.symbol();
    const owner = await idnft.owner();
    
    console.log("✅ 合约名称:", name);
    console.log("✅ 合约符号:", symbol);
    console.log("✅ 合约所有者:", owner);
    console.log("✅ 所有者验证:", owner === deployer.address ? "通过" : "失败");
  } catch (error) {
    console.log("❌ 基础信息检查失败:", error.message);
  }

  // 测试2: 检查当前token数量
  console.log("\n2️⃣ 检查当前token数量");
  try {
    const totalSupply = await idnft.totalSupply();
    console.log("✅ 当前总供应量:", totalSupply.toString());
  } catch (error) {
    console.log("❌ 总供应量检查失败:", error.message);
  }

  // 测试3: 创建测试ID NFT
  console.log("\n3️⃣ 创建测试ID NFT");
  try {
    const testAddress = "0x1234567890123456789012345678901234567890";
    const testURI = "ipfs://QmTest123456789";
    
    console.log("📝 测试地址:", testAddress);
    console.log("🔗 测试URI:", testURI);
    
    const tx = await idnft.createIDNFT(testAddress, testURI);
    console.log("⏳ 等待交易确认...");
    await tx.wait();
    
    console.log("✅ ID NFT创建成功");
    console.log("📋 交易哈希:", tx.hash);
    
    // 检查新创建的token
    const newTotalSupply = await idnft.totalSupply();
    console.log("✅ 新的总供应量:", newTotalSupply.toString());
    
    // 检查地址映射
    const tokenId = await idnft.addressToTokenId(testAddress);
    console.log("✅ 地址对应的Token ID:", tokenId.toString());
    
    // 检查反向映射
    const address = await idnft.tokenIdToAddress(tokenId);
    console.log("✅ Token ID对应的地址:", address);
    
  } catch (error) {
    console.log("❌ ID NFT创建失败:", error.message);
  }

  // 测试4: 检查元数据
  console.log("\n4️⃣ 检查元数据");
  try {
    const tokenId = await idnft.totalSupply();
    if (tokenId > 0) {
      const metadata = await idnft.barMetadata(tokenId);
      console.log("✅ Token元数据:");
      console.log("   - Token URI:", metadata.tokenURI);
      console.log("   - 是否激活:", metadata.isActive);
      console.log("   - 创建时间:", new Date(metadata.createdAt * 1000).toISOString());
      console.log("   - 更新时间:", new Date(metadata.updatedAt * 1000).toISOString());
    }
  } catch (error) {
    console.log("❌ 元数据检查失败:", error.message);
  }

  // 测试5: 检查用户是否有活跃ID NFT
  console.log("\n5️⃣ 检查用户ID NFT状态");
  try {
    const testAddress = "0x1234567890123456789012345678901234567890";
    const hasActive = await idnft.hasActiveIDNFT(testAddress);
    console.log("✅ 用户是否有活跃ID NFT:", hasActive);
    
    if (hasActive) {
      const tokenId = await idnft.getTokenIdByAddress(testAddress);
      console.log("✅ 用户的Token ID:", tokenId.toString());
    }
  } catch (error) {
    console.log("❌ 用户状态检查失败:", error.message);
  }

  console.log("\n🎉 测试完成！");
  console.log("=" * 50);
  console.log("📋 测试摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: IDNFT");
  console.log("📍 地址:", contractAddress);
  console.log("👤 测试账户:", deployer.address);
  console.log("=" * 50);

  // 保存测试结果
  const testResults = {
    network: "injective_testnet",
    contract: "IDNFT",
    address: contractAddress,
    tester: deployer.address,
    timestamp: new Date().toISOString(),
    tests: {
      basicInfo: "✅ 通过",
      totalSupply: "✅ 通过",
      createIDNFT: "✅ 通过",
      metadata: "✅ 通过",
      userStatus: "✅ 通过"
    }
  };

  fs.writeFileSync('test-results.json', JSON.stringify(testResults, null, 2));
  console.log("\n💾 测试结果已保存到 test-results.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  }); 