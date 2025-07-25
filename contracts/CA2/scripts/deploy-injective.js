const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 RecipeNFT 到 Injective 测试网...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "INJ");

  // 部署 RecipeNFT 合约
  console.log("\n📦 部署 RecipeNFT 合约...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe NFT", "BHBRecipe");
  
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

  // 测试铸造功能
  console.log("\n🎨 测试铸造功能...");
  const testURI = "ipfs://QmTestRecipe123456789";
  const mintTx = await recipeNFT.mintRecipeNFT(testURI);
  console.log("⏳ 等待铸造交易确认...");
  await mintTx.wait();
  
  // 获取铸造的token ID（通过事件或直接查询）
  const receipt = await mintTx.wait();
  let tokenId = 1; // 默认值
  if (receipt.logs && receipt.logs.length > 0) {
    // 尝试从事件中获取token ID
    for (const log of receipt.logs) {
      try {
        const parsedLog = recipeNFT.interface.parseLog(log);
        if (parsedLog && parsedLog.name === 'RecipeNFTCreated') {
          tokenId = parsedLog.args.tokenId.toString();
          break;
        }
      } catch (e) {
        // 忽略解析错误
      }
    }
  }
  console.log("✅ 成功铸造 Recipe NFT, Token ID:", tokenId);

  console.log("\n🎉 部署完成！");
  console.log("=" * 50);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: RecipeNFT");
  console.log("📍 地址:", recipeNFTAddress);
  console.log("👤 部署者:", deployer.address);
  console.log("🎨 测试Token ID:", tokenId.toString());
  console.log("=" * 50);

  // 保存部署信息
  const deploymentInfo = {
    network: "injective_testnet",
    contract: "RecipeNFT",
    address: recipeNFTAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 1439,
    testTokenId: tokenId.toString()
  };

  console.log("\n💾 部署信息已保存到 deployment-info.json");
  require('fs').writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  return {
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