const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 RecipeNFT 合约到 Injective 测试网...");
  
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "USDT");

  // 部署 RecipeNFT 合约
  console.log("\n📦 部署 RecipeNFT 合约...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  
  // 注意：这里需要传入ID NFT合约地址，暂时使用零地址作为占位符
  // 在实际部署时，需要先部署ID NFT合约，然后传入其地址
  const idnftContractAddress = "0x0000000000000000000000000000000000000000"; // 占位符
  
  const recipeNFT = await RecipeNFT.deploy(
    "Bars Help Bars Recipe NFT", 
    "BHBRecipe",
    idnftContractAddress
  );
  
  console.log("⏳ 等待交易确认...");
  await recipeNFT.waitForDeployment();
  
  const recipeNFTAddress = await recipeNFT.getAddress();
  console.log("✅ RecipeNFT 合约已部署到:", recipeNFTAddress);

  // 验证合约部署
  console.log("\n🔍 验证合约部署...");
  const code = await deployer.provider.getCode(recipeNFTAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败 - 地址上没有代码");
  }
  console.log("✅ 合约代码验证成功");

  // 测试基本功能
  console.log("\n🧪 测试基本功能...");
  
  // 检查合约名称和符号
  const name = await recipeNFT.name();
  const symbol = await recipeNFT.symbol();
  console.log("📛 合约名称:", name);
  console.log("🔤 合约符号:", symbol);

  // 检查合约所有者
  const owner = await recipeNFT.owner();
  console.log("👑 合约所有者:", owner);
  console.log("✅ 所有者验证:", owner === deployer.address ? "通过" : "失败");

  // 检查ID NFT合约地址
  const idnftContract = await recipeNFT.idnftContract();
  console.log("🔗 ID NFT合约地址:", idnftContract);
  console.log("⚠️  注意：需要后续设置正确的ID NFT合约地址");

  console.log("\n🎉 部署完成！");
  console.log("=" * 50);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: RecipeNFT");
  console.log("📍 地址:", recipeNFTAddress);
  console.log("👤 部署者:", deployer.address);
  console.log("🔗 ID NFT合约:", idnftContract);
  console.log("=" * 50);

  // 保存部署信息
  const deploymentInfo = {
    network: "injective_testnet",
    contract: "RecipeNFT",
    address: recipeNFTAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 1439,
    idnftContractAddress: idnftContract,
    note: "需要后续设置正确的ID NFT合约地址"
  };

  console.log("\n💾 部署信息已保存到 deployment-info.json");
  require('fs').writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  return {
    recipeNFTAddress,
    deployer: deployer.address,
    idnftContractAddress: idnftContract
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 