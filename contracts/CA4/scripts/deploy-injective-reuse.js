const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 开始部署 CA4 合约到 Injective 测试网（重用CA1和CA2合约）...");
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "USDT");

  // 读取CA1和CA2的部署信息
  let ca1DeploymentInfo, ca2DeploymentInfo;
  try {
    ca1DeploymentInfo = JSON.parse(fs.readFileSync('../CA1/deployment-info.json', 'utf8'));
    ca2DeploymentInfo = JSON.parse(fs.readFileSync('../CA2/deployment-info.json', 'utf8'));
  } catch (error) {
    console.error("❌ 未找到CA1或CA2的部署信息");
    console.log("请先部署CA1和CA2合约");
    return;
  }

  const idnftAddress = ca1DeploymentInfo.address;
  const recipeNFTAddress = ca2DeploymentInfo.address;

  console.log("📦 使用已部署的合约地址:");
  console.log("   - IDNFT (CA1):", idnftAddress);
  console.log("   - RecipeNFT (CA2):", recipeNFTAddress);

  // 部署 MockUSDT 合约
  console.log("\n📦 部署 MockUSDT 合约...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy("Mock USDT", "mUSDT");
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("✅ MockUSDT 合约已部署到:", mockUSDTAddress);

  // 部署 RecipeMarketplace 合约（使用已部署的IDNFT和RecipeNFT地址）
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
  const contracts = [mockUSDTAddress, marketplaceAddress];
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

  // 检查合约所有者
  const usdtOwner = await mockUSDT.owner();
  const marketplaceOwner = await marketplace.owner();
  
  console.log("👑 合约所有者验证:");
  console.log("   - MockUSDT:", usdtOwner === deployer.address ? "✅" : "❌");
  console.log("   - Marketplace:", marketplaceOwner === deployer.address ? "✅" : "❌");

  // 测试铸造USDT
  console.log("\n💰 测试铸造USDT...");
  const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
  const mintTx = await mockUSDT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  const balance = await mockUSDT.balanceOf(deployer.address);
  console.log("✅ USDT铸造成功，余额:", ethers.formatUnits(balance, 6), "USDT");

  // 检查市场合约配置
  console.log("\n🔗 检查市场合约配置...");
  const marketplaceUSDT = await marketplace.usdtToken();
  const marketplaceIDNFT = await marketplace.idnftContract();
  const marketplaceRecipeNFT = await marketplace.recipeNFTContract();
  
  console.log("✅ 市场合约配置验证:");
  console.log("   - USDT 地址:", marketplaceUSDT);
  console.log("   - IDNFT 地址:", marketplaceIDNFT);
  console.log("   - RecipeNFT 地址:", marketplaceRecipeNFT);

  console.log("\n🎉 部署完成！");
  console.log("=" * 60);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: CA4 市场系统（重用CA1和CA2合约）");
  console.log("📍 主要地址:");
  console.log("   - MockUSDT:", mockUSDTAddress);
  console.log("   - IDNFT (重用CA1):", idnftAddress);
  console.log("   - RecipeNFT (重用CA2):", recipeNFTAddress);
  console.log("   - Marketplace:", marketplaceAddress);
  console.log("👤 部署者:", deployer.address);
  console.log("💰 USDT余额:", ethers.formatUnits(balance, 6), "USDT");
  console.log("=" * 60);

  // 保存部署信息
  const deploymentInfo = {
    network: "injective_testnet",
    contracts: {
      mockUSDT: mockUSDTAddress,
      idnft: idnftAddress, // 重用CA1的地址
      recipeNFT: recipeNFTAddress, // 重用CA2的地址
      marketplace: marketplaceAddress
    },
    reusedContracts: {
      ca1: {
        address: idnftAddress,
        deploymentFile: "../CA1/deployment-info.json"
      },
      ca2: {
        address: recipeNFTAddress,
        deploymentFile: "../CA2/deployment-info.json"
      }
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 1439,
    testData: {
      usdtMinted: ethers.formatUnits(mintAmount, 6)
    }
  };

  console.log("\n💾 部署信息已保存到 deployment-info-reuse.json");
  require('fs').writeFileSync(
    'deployment-info-reuse.json',
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