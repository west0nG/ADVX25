const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 CA4 合约到 Injective 测试网...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "INJ");

  // 部署 MockUSDT 合约
  console.log("\n📦 部署 MockUSDT 合约...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy("Mock USDT", "mUSDT");
  
  console.log("⏳ 等待 MockUSDT 部署确认...");
  await mockUSDT.waitForDeployment();
  
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("✅ MockUSDT 合约已部署到:", mockUSDTAddress);

  // 部署 IDNFT 合约
  console.log("\n📦 部署 IDNFT 合约...");
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const idnft = await IDNFT.deploy("Bars Help Bars ID NFT", "BHBNFT");
  
  console.log("⏳ 等待 IDNFT 部署确认...");
  await idnft.waitForDeployment();
  
  const idnftAddress = await idnft.getAddress();
  console.log("✅ IDNFT 合约已部署到:", idnftAddress);

  // 部署 RecipeNFT 合约
  console.log("\n📦 部署 RecipeNFT 合约...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe NFT", "BHBRecipe");
  
  console.log("⏳ 等待 RecipeNFT 部署确认...");
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
  
  console.log("⏳ 等待 RecipeMarketplace 部署确认...");
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
  
  // 检查合约基本信息
  const usdtName = await mockUSDT.name();
  const usdtSymbol = await mockUSDT.symbol();
  console.log("📛 MockUSDT 名称:", usdtName);
  console.log("🔤 MockUSDT 符号:", usdtSymbol);

  const idnftName = await idnft.name();
  const idnftSymbol = await idnft.symbol();
  console.log("📛 IDNFT 名称:", idnftName);
  console.log("🔤 IDNFT 符号:", idnftSymbol);

  const recipeName = await recipeNFT.name();
  const recipeSymbol = await recipeNFT.symbol();
  console.log("📛 RecipeNFT 名称:", recipeName);
  console.log("🔤 RecipeNFT 符号:", recipeSymbol);

  // 检查市场合约配置
  const marketplaceUSDT = await marketplace.usdtToken();
  const marketplaceIDNFT = await marketplace.idnftContract();
  const marketplaceRecipeNFT = await marketplace.recipeNFTContract();
  
  console.log("✅ 市场合约配置验证:");
  console.log("   - USDT 地址:", marketplaceUSDT);
  console.log("   - IDNFT 地址:", marketplaceIDNFT);
  console.log("   - RecipeNFT 地址:", marketplaceRecipeNFT);

  // 测试铸造功能
  console.log("\n🎨 测试铸造功能...");
  
  // 铸造一些USDT
  const mintAmount = ethers.parseEther("10000"); // 10,000 USDT
  const mintTx = await mockUSDT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("✅ 铸造 USDT 成功:", ethers.formatEther(mintAmount), "USDT");

  // 创建ID NFT
  const idnftURI = "ipfs://QmTestIDNFT123456789";
  const createIDNFTTx = await idnft.createIDNFT(deployer.address, idnftURI);
  await createIDNFTTx.wait();
  console.log("✅ 创建 ID NFT 成功");

  // 铸造Recipe NFT
  const recipeURI = "ipfs://QmTestRecipe123456789";
  const mintRecipeTx = await recipeNFT.mintRecipeNFT(recipeURI);
  await mintRecipeTx.wait();
  console.log("✅ 铸造 Recipe NFT 成功");

  console.log("\n🎉 部署完成！");
  console.log("=" * 60);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: CA4 完整套件");
  console.log("📍 合约地址:");
  console.log("   - MockUSDT:", mockUSDTAddress);
  console.log("   - IDNFT:", idnftAddress);
  console.log("   - RecipeNFT:", recipeNFTAddress);
  console.log("   - RecipeMarketplace:", marketplaceAddress);
  console.log("👤 部署者:", deployer.address);
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
      usdtMinted: ethers.formatEther(mintAmount),
      idnftURI: idnftURI,
      recipeURI: recipeURI
    }
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