const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署 RecipeMarketplace 合约到 Sepolia 测试网...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

  // Sepolia测试网上的合约地址（需要根据实际部署情况更新）
  const USDT_ADDRESS = process.env.USDT_ADDRESS || "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"; // Sepolia USDT
  const IDNFT_ADDRESS = process.env.IDNFT_ADDRESS || "0x..."; // 需要填入实际部署的IDNFT地址
  const RECIPE_NFT_ADDRESS = process.env.RECIPE_NFT_ADDRESS || "0x..."; // 需要填入实际部署的RecipeNFT地址

  console.log("使用的合约地址:");
  console.log("USDT:", USDT_ADDRESS);
  console.log("IDNFT:", IDNFT_ADDRESS);
  console.log("RecipeNFT:", RECIPE_NFT_ADDRESS);

  // 验证地址不为空
  if (IDNFT_ADDRESS === "0x..." || RECIPE_NFT_ADDRESS === "0x...") {
    console.error("错误: 请先部署IDNFT和RecipeNFT合约，然后更新环境变量中的地址");
    process.exit(1);
  }

  // 部署RecipeMarketplace合约
  console.log("\n部署RecipeMarketplace合约...");
  const RecipeMarketplace = await ethers.getContractFactory("RecipeMarketplace");
  const marketplace = await RecipeMarketplace.deploy(
    USDT_ADDRESS,
    IDNFT_ADDRESS,
    RECIPE_NFT_ADDRESS
  );
  await marketplace.waitForDeployment();
  console.log("RecipeMarketplace 已部署到:", await marketplace.getAddress());

  console.log("\n=== 部署完成 ===");
  console.log("RecipeMarketplace:", await marketplace.getAddress());

  // 验证合约配置
  console.log("\n=== 验证合约配置 ===");
  console.log("Marketplace USDT地址:", await marketplace.usdtToken());
  console.log("Marketplace IDNFT地址:", await marketplace.idnftContract());
  console.log("Marketplace RecipeNFT地址:", await marketplace.recipeNFTContract());
  console.log("平台费用比例:", await marketplace.platformFeeRate(), "基点");
  console.log("默认授权期限:", await marketplace.defaultAuthorizationDuration(), "秒");

  // 保存部署信息
  const deploymentInfo = {
    network: "sepolia",
    deployer: deployer.address,
    marketplace: await marketplace.getAddress(),
    usdt: USDT_ADDRESS,
    idnft: IDNFT_ADDRESS,
    recipeNFT: RECIPE_NFT_ADDRESS,
    timestamp: new Date().toISOString()
  };

  console.log("\n=== 部署信息 ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 