const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 RecipeNFT 合约到 Sepolia 测试网...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "ETH");

  // 部署 RecipeNFT 合约
  const RecipeNFT = await ethers.getContractFactory("RecipeNFT");
  const recipeNFT = await RecipeNFT.deploy("Bars Help Bars Recipe", "BHBR");
  
  console.log("⏳ 等待合约部署...");
  await recipeNFT.waitForDeployment();

  const contractAddress = await recipeNFT.getAddress();
  console.log("✅ RecipeNFT 合约部署成功!");
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${contractAddress}`);

  // 验证合约
  console.log("\n🔍 验证合约信息...");
  const name = await recipeNFT.name();
  const symbol = await recipeNFT.symbol();
  console.log("📛 合约名称:", name);
  console.log("🏷️  合约符号:", symbol);

  // 测试铸造一个NFT
  console.log("\n🧪 测试铸造一个NFT...");
  const testURI = "ipfs://QmTestRecipeHash123456789";
  const mintTx = await recipeNFT.mintRecipeNFT(testURI);
  await mintTx.wait();
  console.log("✅ 测试NFT铸造成功!");

  // 获取NFT信息
  const tokenId = 1;
  const owner = await recipeNFT.ownerOf(tokenId);
  const tokenURI = await recipeNFT.tokenURI(tokenId);
  console.log("🆔 Token ID:", tokenId);
  console.log("👤 拥有者:", owner);
  console.log("🔗 Token URI:", tokenURI);

  console.log("\n🎉 部署和测试完成!");
  console.log("\n📋 下一步操作:");
  console.log("1. 复制合约地址:", recipeNFT.address);
  console.log("2. 在 test-frontend.html 中输入合约地址");
  console.log("3. 连接 MetaMask 钱包 (确保切换到 Sepolia 网络)");
  console.log("4. 开始测试 ERC-4907 授权功能");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 