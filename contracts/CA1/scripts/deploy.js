const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署 Bars Help Bars 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());

  // 部署 IDNFT 合约
  console.log("\n部署 IDNFT 合约...");
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const idnft = await IDNFT.deploy("Bars Help Bars ID", "BHBI");
  await idnft.deployed();

  console.log("IDNFT 合约已部署到:", idnft.address);

  // 验证合约
  console.log("\n等待区块确认...");
  await idnft.deployTransaction.wait(5);

  console.log("\n=== 部署完成 ===");
  console.log("IDNFT 合约地址:", idnft.address);
  console.log("网络:", network.name);
  console.log("部署账户:", deployer.address);

  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    deployer: deployer.address,
    contracts: {
      IDNFT: idnft.address
    },
    timestamp: new Date().toISOString()
  };

  console.log("\n部署信息:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 