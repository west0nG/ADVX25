const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署到 Injective 测试网...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署账户:", deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "INJ");

  // 部署 IDNFT 合约
  console.log("\n📦 部署 IDNFT 合约...");
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const idnft = await IDNFT.deploy("Bars Help Bars ID NFT", "BHBNFT");
  
  console.log("⏳ 等待交易确认...");
  await idnft.waitForDeployment();
  
  const idnftAddress = await idnft.getAddress();
  console.log("✅ IDNFT 合约已部署到:", idnftAddress);

  // 验证合约部署
  console.log("\n🔍 验证合约部署...");
  const code = await deployer.provider.getCode(idnftAddress);
  if (code === "0x") {
    throw new Error("❌ 合约部署失败 - 地址上没有代码");
  }
  console.log("✅ 合约代码验证成功");

  // 测试基本功能
  console.log("\n🧪 测试基本功能...");
  
  // 检查合约名称和符号
  const name = await idnft.name();
  const symbol = await idnft.symbol();
  console.log("📛 合约名称:", name);
  console.log("🔤 合约符号:", symbol);

  // 检查合约所有者
  const owner = await idnft.owner();
  console.log("👑 合约所有者:", owner);
  console.log("✅ 所有者验证:", owner === deployer.address ? "通过" : "失败");

  console.log("\n🎉 部署完成！");
  console.log("=" * 50);
  console.log("📋 部署摘要:");
  console.log("🌐 网络: Injective 测试网");
  console.log("📦 合约: IDNFT");
  console.log("📍 地址:", idnftAddress);
  console.log("👤 部署者:", deployer.address);
  console.log("=" * 50);

  // 保存部署信息
  const deploymentInfo = {
    network: "injective_testnet",
    contract: "IDNFT",
    address: idnftAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    chainId: 888
  };

  console.log("\n💾 部署信息已保存到 deployment-info.json");
  require('fs').writeFileSync(
    'deployment-info.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );

  return {
    idnftAddress,
    deployer: deployer.address
  };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 