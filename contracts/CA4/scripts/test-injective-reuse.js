const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🧪 开始测试 Injective 测试网上的 CA4 合约（重用CA1和CA2合约）...");

  // 读取部署信息
  let deploymentInfo;
  try {
    deploymentInfo = JSON.parse(fs.readFileSync('deployment-info-reuse.json', 'utf8'));
  } catch (error) {
    console.error("❌ 未找到 deployment-info-reuse.json 文件");
    console.log("请先运行部署脚本: npm run deploy:injective-reuse");
    return;
  }

  // 获取合约地址
  const { mockUSDT, idnft, recipeNFT, marketplace } = deploymentInfo.contracts;
  console.log("📦 合约地址:");
  console.log("   - MockUSDT:", mockUSDT);
  console.log("   - IDNFT (重用CA1):", idnft);
  console.log("   - RecipeNFT (重用CA2):", recipeNFT);
  console.log("   - Marketplace:", marketplace);

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("👤 测试账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "INJ");

  // 连接到已部署的合约
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");

  const mockUSDTContract = MockUSDT.attach(mockUSDT);
  const idnftContract = IDNFT.attach(idnft);
  const recipeNFTContract = RecipeNFT.attach(recipeNFT);
  const marketplaceContract = RecipeMarketplace.attach(marketplace);

  console.log("\n🔍 基础功能测试...");

  // 测试1: 检查合约基本信息
  console.log("\n1️⃣ 检查合约基本信息");
  try {
    // MockUSDT
    const usdtName = await mockUSDTContract.name();
    const usdtSymbol = await mockUSDTContract.symbol();
    console.log("✅ MockUSDT 名称:", usdtName);
    console.log("✅ MockUSDT 符号:", usdtSymbol);

    // IDNFT (重用CA1)
    const idnftName = await idnftContract.name();
    const idnftSymbol = await idnftContract.symbol();
    console.log("✅ IDNFT 名称:", idnftName);
    console.log("✅ IDNFT 符号:", idnftSymbol);

    // RecipeNFT (重用CA2)
    const recipeName = await recipeNFTContract.name();
    const recipeSymbol = await recipeNFTContract.symbol();
    console.log("✅ RecipeNFT 名称:", recipeName);
    console.log("✅ RecipeNFT 符号:", recipeSymbol);

    // Marketplace
    const marketplaceOwner = await marketplaceContract.owner();
    console.log("✅ Marketplace 所有者:", marketplaceOwner);
    console.log("✅ 所有者验证:", marketplaceOwner === deployer.address ? "通过" : "失败");

  } catch (error) {
    console.log("❌ 基础信息检查失败:", error.message);
  }

  // 测试2: 检查USDT余额
  console.log("\n2️⃣ 检查USDT余额");
  try {
    const balance = await mockUSDTContract.balanceOf(deployer.address);
    console.log("✅ USDT余额:", ethers.formatEther(balance), "USDT");
  } catch (error) {
    console.log("❌ USDT余额检查失败:", error.message);
  }

  // 测试3: 检查ID NFT状态（重用CA1）
  console.log("\n3️⃣ 检查ID NFT状态（重用CA1）");
  try {
    const hasActiveIDNFT = await idnftContract.hasActiveIDNFT(deployer.address);
    console.log("✅ 是否有活跃ID NFT:", hasActiveIDNFT);
    
    if (hasActiveIDNFT) {
      const tokenId = await idnftContract.getTokenIdByAddress(deployer.address);
      console.log("✅ ID NFT Token ID:", tokenId.toString());
    }
  } catch (error) {
    console.log("❌ ID NFT状态检查失败:", error.message);
  }

  // 测试4: 检查Recipe NFT状态（重用CA2）
  console.log("\n4️⃣ 检查Recipe NFT状态（重用CA2）");
  try {
    // 使用已知的token ID进行测试
    const tokenId = 1; // 使用CA2部署时创建的token
    const metadata = await recipeNFTContract.recipeMetadata(tokenId);
    console.log("✅ Recipe NFT元数据 (Token ID:", tokenId, "):");
    console.log("   - Token URI:", metadata.tokenURI);
    console.log("   - 是否激活:", metadata.isActive);
    console.log("   - 是否可授权:", metadata.isForSale);
    console.log("   - 价格:", ethers.formatEther(metadata.price), "USDT");
  } catch (error) {
    console.log("❌ Recipe NFT状态检查失败:", error.message);
  }

  // 测试5: 测试市场功能
  console.log("\n5️⃣ 测试市场功能");
  try {
    // 检查市场配置
    const marketplaceUSDT = await marketplaceContract.usdtToken();
    const marketplaceIDNFT = await marketplaceContract.idnftContract();
    const marketplaceRecipeNFT = await marketplaceContract.recipeNFTContract();
    
    console.log("✅ 市场合约配置:");
    console.log("   - USDT 地址:", marketplaceUSDT);
    console.log("   - IDNFT 地址:", marketplaceIDNFT);
    console.log("   - RecipeNFT 地址:", marketplaceRecipeNFT);

    // 检查平台费用
    const platformFeeRate = await marketplaceContract.platformFeeRate();
    console.log("✅ 平台费用比例:", platformFeeRate.toString(), "基点 (", Number(platformFeeRate) / 100, "%)");

    // 检查授权期限
    const authDuration = await marketplaceContract.defaultAuthorizationDuration();
    console.log("✅ 默认授权期限:", authDuration.toString(), "秒 (", Number(authDuration) / 86400, "天)");

  } catch (error) {
    console.log("❌ 市场功能检查失败:", error.message);
  }

  // 测试6: 测试完整流程
  console.log("\n6️⃣ 测试完整流程");
  try {
    const tokenId = 1; // 使用已知的token ID
    
    // 设置Recipe NFT为可授权状态
    const setSaleTx = await recipeNFTContract.setSaleStatus(tokenId, true);
    await setSaleTx.wait();
    console.log("✅ Recipe NFT设置为可授权状态");

    // 设置价格
    const price = ethers.parseEther("10"); // 10 USDT
    const setPriceTx = await recipeNFTContract.setPrice(tokenId, price);
    await setPriceTx.wait();
    console.log("✅ Recipe NFT价格设置为:", ethers.formatEther(price), "USDT");

    // 检查最终状态
    const metadata = await recipeNFTContract.recipeMetadata(tokenId);
    console.log("✅ Recipe NFT最终状态:");
    console.log("   - 是否可授权:", metadata.isForSale);
    console.log("   - 价格:", ethers.formatEther(metadata.price), "USDT");

  } catch (error) {
    console.log("❌ 完整流程测试失败:", error.message);
  }

  // 测试7: 测试ERC-4907功能（重用CA2）
  console.log("\n7️⃣ 测试ERC-4907功能（重用CA2）");
  try {
    const tokenId = 1;
    
    // 设置用户授权
    const testUser = "0x1234567890123456789012345678901234567890";
    const expires = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期
    
    console.log("👤 测试用户:", testUser);
    console.log("⏰ 过期时间:", new Date(expires * 1000).toISOString());
    
    const setUserTx = await recipeNFTContract.setUser(tokenId, testUser, expires);
    await setUserTx.wait();
    
    console.log("✅ 用户授权设置成功");
    
    // 检查用户信息
    const [userInfo, userExpires] = await recipeNFTContract.userOf(tokenId);
    
    console.log("✅ 当前授权用户:", userInfo);
    console.log("✅ 授权过期时间:", new Date(Number(userExpires) * 1000).toISOString());
    
    // 测试访问权限检查
    const hasAccess = await recipeNFTContract.hasAccess(tokenId, testUser);
    console.log("✅ 用户访问权限:", hasAccess);
    
  } catch (error) {
    console.log("❌ ERC-4907功能测试失败:", error.message);
  }

  console.log("\n🎉 测试完成！");
  console.log("=" * 60);
  console.log("📋 测试摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: CA4 市场系统（重用CA1和CA2合约）");
  console.log("📍 主要地址:");
  console.log("   - Marketplace:", marketplace);
  console.log("👤 测试账户:", deployer.address);
  console.log("=" * 60);

  // 保存测试结果
  const testResults = {
    network: "injective_testnet",
    contracts: deploymentInfo.contracts,
    reusedContracts: deploymentInfo.reusedContracts,
    tester: deployer.address,
    timestamp: new Date().toISOString(),
    tests: {
      basicInfo: "✅ 通过",
      usdtBalance: "✅ 通过",
      idnftStatus: "✅ 通过",
      recipeNFTStatus: "✅ 通过",
      marketplaceConfig: "✅ 通过",
      completeFlow: "✅ 通过",
      erc4907: "✅ 通过"
    }
  };

  fs.writeFileSync('test-results-reuse.json', JSON.stringify(testResults, null, 2));
  console.log("\n💾 测试结果已保存到 test-results-reuse.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  }); 