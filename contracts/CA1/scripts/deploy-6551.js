const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始部署 IDNFT6551 合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📝 部署者地址:", deployer.address);

  // 部署合约
  const IDNFT6551 = await ethers.getContractFactory("IDNFT6551");
  const idnft6551 = await IDNFT6551.deploy("ID NFT 6551", "IDNFT6551");
  
  console.log("⏳ 等待合约部署确认...");
  await idnft6551.deployed();

  console.log("✅ IDNFT6551 合约部署成功!");
  console.log("📍 合约地址:", idnft6551.address);
  console.log("🔗 Sepolia Etherscan:", `https://sepolia.etherscan.io/address/${idnft6551.address}`);

  // 验证合约信息
  console.log("\n📋 合约信息:");
  console.log("名称:", await idnft6551.name());
  console.log("符号:", await idnft6551.symbol());
  console.log("所有者:", await idnft6551.owner());
  console.log("ERC-6551支持:", await idnft6551.supportsERC6551());

  // 保存部署信息
  const deploymentInfo = {
    contractName: "IDNFT6551",
    contractAddress: idnft6551.address,
    deployer: deployer.address,
    network: "sepolia",
    timestamp: new Date().toISOString(),
    constructorArgs: ["ID NFT 6551", "IDNFT6551"]
  };

  console.log("\n💾 部署信息已保存:");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 部署完成! 现在你可以:");
  console.log("1. 使用前端界面连接钱包");
  console.log("2. 输入合约地址进行测试");
  console.log("3. 铸造你的第一个ERC-6551 ID NFT");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  }); 