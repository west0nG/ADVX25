const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署 RecipeMarketplace 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "USDT");

  // 部署模拟USDT合约（用于测试）
  console.log("\n部署模拟USDT合约...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy("Mock USDT", "mUSDT");
  await mockUSDT.waitForDeployment();
  console.log("MockUSDT 已部署到:", await mockUSDT.getAddress());

  // 部署ID NFT合约
  console.log("\n部署ID NFT合约...");
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const idnft = await IDNFT.deploy("Bar ID NFT", "BIDNFT");
  await idnft.waitForDeployment();
  console.log("IDNFT 已部署到:", await idnft.getAddress());

  // 部署Recipe NFT合约
  console.log("\n部署Recipe NFT合约...");
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy("Recipe NFT", "RNFT");
  await recipeNFT.waitForDeployment();
  console.log("RecipeNFT 已部署到:", await recipeNFT.getAddress());

  // 部署RecipeMarketplace合约
  console.log("\n部署RecipeMarketplace合约...");
  const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
  const marketplace = await RecipeMarketplace.deploy(
    await mockUSDT.getAddress(),
    await idnft.getAddress(),
    await recipeNFT.getAddress()
  );
  await marketplace.waitForDeployment();
  console.log("RecipeMarketplace 已部署到:", await marketplace.getAddress());

  console.log("\n=== 部署完成 ===");
  console.log("MockUSDT:", await mockUSDT.getAddress());
  console.log("IDNFT:", await idnft.getAddress());
  console.log("RecipeNFT:", await recipeNFT.getAddress());
  console.log("RecipeMarketplace:", await marketplace.getAddress());

  // 验证合约配置
  console.log("\n=== 验证合约配置 ===");
  console.log("Marketplace USDT地址:", await marketplace.usdtToken());
  console.log("Marketplace IDNFT地址:", await marketplace.idnftContract());
  console.log("Marketplace RecipeNFT地址:", await marketplace.recipeNFTContract());
  console.log("平台费用比例:", await marketplace.platformFeeRate(), "基点");
  console.log("默认授权期限:", await marketplace.defaultAuthorizationDuration(), "秒");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 