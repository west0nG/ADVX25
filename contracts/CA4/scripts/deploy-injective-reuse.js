const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 开始部署 CA4 合约到 Injective 测试网（重用CA1和CA2合约）...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "INJ");

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
  
  console.log("⏳ 等待 MockUSDT 部署确认...");
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
  
  console.log("⏳ 等待 RecipeMarketplace 部署确认...");
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
  
  // 检查合约基本信息
  const usdtName = await mockUSDT.name();
  const usdtSymbol = await mockUSDT.symbol();
  console.log("📛 MockUSDT 名称:", usdtName);
  console.log("🔤 MockUSDT 符号:", usdtSymbol);

  // 连接到已部署的IDNFT和RecipeNFT合约
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  
  const idnftContract = IDNFT.attach(idnftAddress);
  const recipeNFTContract = RecipeNFT.attach(recipeNFTAddress);

  const idnftName = await idnftContract.name();
  const idnftSymbol = await idnftContract.symbol();
  console.log("📛 IDNFT 名称:", idnftName);
  console.log("🔤 IDNFT 符号:", idnftSymbol);

  const recipeName = await recipeNFTContract.name();
  const recipeSymbol = await recipeNFTContract.symbol();
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

  // 检查是否已有ID NFT（从CA1部署时创建）
  const hasActiveIDNFT = await idnftContract.hasActiveIDNFT(deployer.address);
  if (hasActiveIDNFT) {
    console.log("✅ ID NFT 已存在（来自CA1部署）");
  } else {
    // 创建ID NFT
    const idnftURI = "ipfs://QmTestIDNFT123456789";
    const createIDNFTTx = await idnftContract.createIDNFT(deployer.address, idnftURI);
    await createIDNFTTx.wait();
    console.log("✅ 创建 ID NFT 成功");
  }

  // 检查是否已有Recipe NFT（从CA2部署时创建）
  try {
    const tokenId = 1; // 假设CA2部署时创建了token ID 1
    const metadata = await recipeNFTContract.recipeMetadata(tokenId);
    console.log("✅ Recipe NFT 已存在（来自CA2部署）");
  } catch (error) {
    // 铸造Recipe NFT
    const recipeURI = "ipfs://QmTestRecipe123456789";
    const mintRecipeTx = await recipeNFTContract.mintRecipeNFT(recipeURI);
    await mintRecipeTx.wait();
    console.log("✅ 铸造 Recipe NFT 成功");
  }

  console.log("\n🎉 部署完成！");
  console.log("=" * 60);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: CA4 市场系统（重用CA1和CA2合约）");
  console.log("📍 合约地址:");
  console.log("   - MockUSDT:", mockUSDTAddress);
  console.log("   - IDNFT (重用CA1):", idnftAddress);
  console.log("   - RecipeNFT (重用CA2):", recipeNFTAddress);
  console.log("   - RecipeMarketplace:", marketplaceAddress);
  console.log("👤 部署者:", deployer.address);
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
      usdtMinted: ethers.formatEther(mintAmount)
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