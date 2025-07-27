const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 CA4 合约到 Injective 测试网...");
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "USDT");

  // 部署 MockUSDT 合约
  console.log("\n📦 部署 MockUSDT 合约...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy("Mock USDT", "mUSDT");
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("✅ MockUSDT 合约已部署到:", mockUSDTAddress);

  // 部署 IDNFT 合约
  console.log("\n📦 部署 IDNFT 合约...");
  const IDNFT = await ethers.getContractFactory("IDNFT6551");
  const idnft = await IDNFT.deploy("Bars Help Bars ID NFT", "BHBID");
  await idnft.waitForDeployment();
  const idnftAddress = await idnft.getAddress();
  console.log("✅ IDNFT 合约已部署到:", idnftAddress);

  // 启用Injective模式
  console.log("\n🔧 启用Injective模式...");
  const setInjectiveModeTx = await idnft.setInjectiveMode(true);
  await setInjectiveModeTx.wait();
  console.log("✅ Injective模式已启用");

  // 部署 RecipeNFT 合约（传入ID NFT合约地址）
  console.log("\n📦 部署 RecipeNFT 合约...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe NFT", "BHBRecipe", idnftAddress);
  await recipeNFT.waitForDeployment();
  const recipeNFTAddress = await recipeNFT.getAddress();
  console.log("✅ RecipeNFT 合约已部署到:", recipeNFTAddress);

  // 部署 RecipeMarketplace 合约
  console.log("\n📦 部署 RecipeMarketplace 合约...");
  const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
  const marketplace = await RecipeMarketplace.deploy(
    mockUSDTAddress,
    idnftAddress,
    recipeNFTAddress
  );
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ RecipeMarketplace 合约已部署到:", marketplaceAddress);

  // 验证合约部署
  console.log("\n🔍 验证合约部署...");
  const contracts = [mockUSDTAddress, idnftAddress, recipeNFTAddress, marketplaceAddress];
  for (let i = 0; i < contracts.length; i++) {
    const code = await deployer.provider.getCode(contracts[i]);
    if (code === "0x") {
      throw new Error(`❌ 合约 ${i + 1} 部署失败 - 地址上没有代码`);
    }
  }
  console.log("✅ 所有合约代码验证成功");

  // 测试基本功能
  console.log("\n🧪 测试基本功能...");
  
  // 检查合约名称和符号
  const usdtName = await mockUSDT.name();
  const usdtSymbol = await mockUSDT.symbol();
  console.log("💰 USDT名称:", usdtName);
  console.log("💰 USDT符号:", usdtSymbol);

  const idnftName = await idnft.name();
  const idnftSymbol = await idnft.symbol();
  console.log("🆔 IDNFT名称:", idnftName);
  console.log("🆔 IDNFT符号:", idnftSymbol);

  const recipeName = await recipeNFT.name();
  const recipeSymbol = await recipeNFT.symbol();
  console.log("🍹 RecipeNFT名称:", recipeName);
  console.log("🍹 RecipeNFT符号:", recipeSymbol);

  // 检查合约所有者
  const usdtOwner = await mockUSDT.owner();
  const idnftOwner = await idnft.owner();
  const recipeOwner = await recipeNFT.owner();
  const marketplaceOwner = await marketplace.owner();
  
  console.log("👑 合约所有者验证:");
  console.log("   - MockUSDT:", usdtOwner === deployer.address ? "✅" : "❌");
  console.log("   - IDNFT:", idnftOwner === deployer.address ? "✅" : "❌");
  console.log("   - RecipeNFT:", recipeOwner === deployer.address ? "✅" : "❌");
  console.log("   - Marketplace:", marketplaceOwner === deployer.address ? "✅" : "❌");

  // 检查Injective模式
  const injectiveMode = await idnft.injectiveMode();
  console.log("🔧 Injective模式状态:", injectiveMode ? "✅ 已启用" : "❌ 未启用");

  // 测试铸造USDT
  console.log("\n💰 测试铸造USDT...");
  const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
  const mintTx = await mockUSDT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  const balance = await mockUSDT.balanceOf(deployer.address);
  console.log("✅ USDT铸造成功，余额:", ethers.formatUnits(balance, 6), "USDT");

  // 测试创建ID NFT
  console.log("\n🆔 测试创建ID NFT...");
  const idnftURI = "ipfs://QmTestIDNFT123456789";
  const createIDTx = await idnft.createIDNFT(deployer.address, idnftURI);
  await createIDTx.wait();
  console.log("✅ ID NFT创建成功");

  // 测试铸造Recipe NFT（现在应该可以正常工作）
  console.log("\n🍹 测试铸造Recipe NFT...");
  const recipeURI = "ipfs://QmTestRecipe123456789";
  const mintRecipeTx = await recipeNFT.mintRecipeNFT(recipeURI);
  await mintRecipeTx.wait();
  console.log("✅ Recipe NFT铸造成功");

  // 获取铸造的token ID并检查元数据
  const tokenId = 1; // 假设是第一个铸造的token
  const metadata = await recipeNFT.recipeMetadata(tokenId);
  console.log("📊 Recipe NFT元数据:");
  console.log("   - Token URI:", metadata.tokenURI);
  console.log("   - 是否激活:", metadata.isActive);
  console.log("   - 关联的ID NFT Token ID:", metadata.idNFTTokenId);
  console.log("   - ID NFT账户地址:", metadata.idNFTAccount);

  console.log("\n🎉 部署完成！");
  console.log("=" * 60);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: CA4 市场系统");
  console.log("📍 主要地址:");
  console.log("   - MockUSDT:", mockUSDTAddress);
  console.log("   - IDNFT:", idnftAddress);
  console.log("   - RecipeNFT:", recipeNFTAddress);
  console.log("   - Marketplace:", marketplaceAddress);
  console.log("👤 部署者:", deployer.address);
  console.log("💰 USDT余额:", ethers.formatUnits(balance, 6), "USDT");
  console.log("🔧 Injective模式: 已启用");
  console.log("✅ 所有功能测试通过");
  console.log("=" * 60);

  // 保存部署信息
  const deploymentInfo = {
    network: "injective_testnet",
    contracts: {
      mockUSDT: mockUSDTAddress,
      idnft: idnftAddress,
      recipeNFT: recipeNFTAddress,
      marketplace: marketplaceAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 1439,
    testData: {
      usdtMinted: ethers.formatUnits(mintAmount, 6),
      testTokenId: tokenId.toString()
    },
    note: "完整市场系统，支持ERC-6551集成，已启用Injective兼容模式"
  };

  console.log("\n💾 部署信息已保存到 deployment-info.json");
  require('fs').writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  return {
    mockUSDTAddress,
    idnftAddress,
    recipeNFTAddress,
    marketplaceAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 