const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. 部署 MockUSDT
  console.log("\n1. Deploying MockUSDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy("Mock USDT", "mUSDT");
  await mockUSDT.waitForDeployment();
  console.log("MockUSDT deployed to:", await mockUSDT.getAddress());

  // 2. 部署 IDNFT6551
  console.log("\n2. Deploying IDNFT6551...");
  const IDNFT6551 = await ethers.getContractFactory("IDNFT6551");
  const idnft = await IDNFT6551.deploy("Bars Help Bars ID", "BHBI");
  await idnft.waitForDeployment();
  console.log("IDNFT6551 deployed to:", await idnft.getAddress());

  // 3. 部署 RecipeNFT
  console.log("\n3. Deploying RecipeNFT...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe", "BHBR", await idnft.getAddress());
  await recipeNFT.waitForDeployment();
  console.log("RecipeNFT deployed to:", await recipeNFT.getAddress());

  // 4. 部署 RecipeMarketplace
  console.log("\n4. Deploying RecipeMarketplace...");
  const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
  const marketplace = await RecipeMarketplace.deploy(
    await mockUSDT.getAddress(),
    await idnft.getAddress(),
    await recipeNFT.getAddress()
  );
  await marketplace.waitForDeployment();
  console.log("RecipeMarketplace deployed to:", await marketplace.getAddress());

  // 5. 铸造一些测试USDT
  console.log("\n5. Minting test USDT...");
  const mintAmount = ethers.parseUnits("10000", 6); // 10,000 USDT
  const mintTx = await mockUSDT.mint(deployer.address, mintAmount);
  await mintTx.wait();
  console.log("Minted", ethers.formatUnits(mintAmount, 6), "USDT to deployer");

  // 6. 创建测试ID NFT
  console.log("\n6. Creating test ID NFT...");
  const idNFTUri = "ipfs://QmTestIDNFT123456789";
  const createIDTx = await idnft.createIDNFT(deployer.address, idNFTUri);
  await createIDTx.wait();
  console.log("Created ID NFT for deployer");

  // 7. 创建测试Recipe NFT
  console.log("\n7. Creating test Recipe NFT...");
  const recipeUri = "ipfs://QmTestRecipe123456789";
  const createRecipeTx = await recipeNFT.mintRecipeNFT(recipeUri);
  await createRecipeTx.wait();
  console.log("Created Recipe NFT");

  // 8. 设置Recipe为可授权状态
  console.log("\n8. Setting Recipe for sale...");
  const setPriceTx = await recipeNFT.setPrice(1, ethers.parseUnits("10", 6)); // 10 USDT
  await setPriceTx.wait();
  const setSaleTx = await recipeNFT.setSaleStatus(1, true);
  await setSaleTx.wait();
  console.log("Recipe NFT set for sale at 10 USDT");

  // 保存部署信息
  const deploymentInfo = {
    network: "injective_testnet",
    contracts: {
      mockUSDT: await mockUSDT.getAddress(),
      idnft: await idnft.getAddress(),
      recipeNFT: await recipeNFT.getAddress(),
      marketplace: await marketplace.getAddress()
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 1439,
    testData: {
      usdtMinted: "10000.0",
      testTokenId: "1"
    },
    note: "公开权限版本 - 所有用户都有owner权限，支持ERC-6551集成，已启用Injective兼容模式"
  };

  console.log("\n=== Deployment Summary ===");
  console.log("MockUSDT:", await mockUSDT.getAddress());
  console.log("IDNFT6551:", await idnft.getAddress());
  console.log("RecipeNFT:", await recipeNFT.getAddress());
  console.log("RecipeMarketplace:", await marketplace.getAddress());
  console.log("Deployer:", deployer.address);
  console.log("Note: 所有用户都有owner权限");

  // 保存到文件
  const fs = require("fs");
  fs.writeFileSync("deployment-info-public.json", JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to deployment-info-public.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 