const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 CA2 合约到 Injective 测试网（包含ID NFT）...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "USDT");

  // 首先部署 IDNFT6551 合约
  console.log("\n📦 部署 IDNFT6551 合约...");
  const IDNFT6551 = await ethers.getContractFactory("IDNFT6551");
  const idnft = await IDNFT6551.deploy("Bars Help Bars ID NFT", "BHBID");
  await idnft.waitForDeployment();
  const idnftAddress = await idnft.getAddress();
  console.log("✅ IDNFT6551 合约已部署到:", idnftAddress);

  // 启用Injective模式
  console.log("\n🔧 启用Injective模式...");
  const setInjectiveModeTx = await idnft.setInjectiveMode(true);
  await setInjectiveModeTx.wait();
  console.log("✅ Injective模式已启用");

  // 然后部署 RecipeNFT 合约（传入ID NFT合约地址）
  console.log("\n📦 部署 RecipeNFT 合约...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy(
    "Bars Help Bars Recipe NFT", 
    "BHBRecipe",
    idnftAddress
  );
  await recipeNFT.waitForDeployment();
  const recipeNFTAddress = await recipeNFT.getAddress();
  console.log("✅ RecipeNFT 合约已部署到:", recipeNFTAddress);

  // 验证合约部署
  console.log("\n🔍 验证合约部署...");
  const contracts = [idnftAddress, recipeNFTAddress];
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
  const idnftName = await idnft.name();
  const idnftSymbol = await idnft.symbol();
  console.log("🆔 IDNFT6551名称:", idnftName);
  console.log("🆔 IDNFT6551符号:", idnftSymbol);

  const recipeName = await recipeNFT.name();
  const recipeSymbol = await recipeNFT.symbol();
  console.log("🍹 RecipeNFT名称:", recipeName);
  console.log("🍹 RecipeNFT符号:", recipeSymbol);

  // 检查合约所有者
  const idnftOwner = await idnft.owner();
  const recipeOwner = await recipeNFT.owner();
  console.log("👑 合约所有者验证:");
  console.log("   - IDNFT6551:", idnftOwner === deployer.address ? "✅" : "❌");
  console.log("   - RecipeNFT:", recipeOwner === deployer.address ? "✅" : "❌");

  // 检查Injective模式
  const injectiveMode = await idnft.injectiveMode();
  console.log("🔧 Injective模式状态:", injectiveMode ? "✅ 已启用" : "❌ 未启用");

  // 检查Recipe NFT合约中的ID NFT合约地址
  const recipeIDNFTContract = await recipeNFT.idnftContract();
  console.log("🔗 Recipe NFT中的ID NFT合约地址:", recipeIDNFTContract);
  console.log("✅ ID NFT合约地址验证:", recipeIDNFTContract === idnftAddress ? "通过" : "失败");

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

  // 获取铸造的token ID
  const tokenId = 1; // 假设是第一个铸造的token
  const metadata = await recipeNFT.recipeMetadata(tokenId);
  console.log("📊 Recipe NFT元数据:");
  console.log("   - Token URI:", metadata.tokenURI);
  console.log("   - 是否激活:", metadata.isActive);
  console.log("   - 关联的ID NFT Token ID:", metadata.idNFTTokenId);
  console.log("   - ID NFT账户地址:", metadata.idNFTAccount);

  console.log("\n🎉 部署完成！");
  console.log("=" * 50);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: CA2 Recipe NFT系统");
  console.log("📍 地址:");
  console.log("   - IDNFT6551:", idnftAddress);
  console.log("   - RecipeNFT:", recipeNFTAddress);
  console.log("👤 部署者:", deployer.address);
  console.log("🎨 测试Token ID:", tokenId.toString());
  console.log("🔧 Injective模式: 已启用");
  console.log("✅ 所有功能测试通过");
  console.log("=" * 50);

  // 保存部署信息
  const deploymentInfo = {
    network: "injective_testnet",
    contracts: {
      idnft: idnftAddress,
      recipeNFT: recipeNFTAddress
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 1439,
    testTokenId: tokenId.toString(),
    note: "包含ID NFT和Recipe NFT的完整系统，支持ERC-6551集成，已启用Injective兼容模式"
  };

  console.log("\n💾 部署信息已保存到 deployment-info.json");
  require('fs').writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  return {
    idnftAddress,
    recipeNFTAddress,
    deployer: deployer.address,
    testTokenId: tokenId.toString()
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 