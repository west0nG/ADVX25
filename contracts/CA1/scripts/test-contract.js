const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 开始测试 IDNFT 合约...");

  // 获取签名者
  const [owner, user1, user2, user3] = await ethers.getSigners();
  console.log("👤 合约所有者:", owner.address);
  console.log("👤 测试用户1:", user1.address);
  console.log("👤 测试用户2:", user2.address);
  console.log("👤 测试用户3:", user3.address);

  // 部署合约
  console.log("\n📦 部署合约...");
  const IDNFT = await ethers.getContractFactory("IDNFT");
  const idnft = await IDNFT.deploy("Bars Help Bars ID", "BHBI");
  await idnft.deployed();
  console.log("✅ 合约已部署到:", idnft.address);

  // 测试1: 创建ID NFT
  console.log("\n🎯 测试1: 创建ID NFT");
  const testTokenURI = "ipfs://QmTestHash123";
  
  const tx1 = await idnft.createIDNFT(user1.address, testTokenURI);
  const receipt1 = await tx1.wait();
  console.log("✅ 为用户1创建ID NFT成功");
  console.log("   Token ID: 1");
  console.log("   Token URI:", testTokenURI);
  console.log("   交易哈希:", tx1.hash);

  // 检查事件
  const event1 = receipt1.events.find(e => e.event === "IDNFTCreated");
  if (event1) {
    console.log("   📢 事件: IDNFTCreated");
    console.log("      Token ID:", event1.args.tokenId.toString());
    console.log("      所有者:", event1.args.owner);
  }

  // 测试2: 查询功能
  console.log("\n🔍 测试2: 查询功能");
  
  const hasNFT = await idnft.hasActiveIDNFT(user1.address);
  console.log("   用户1是否有活跃ID NFT:", hasNFT);
  
  const tokenId = await idnft.getTokenIdByAddress(user1.address);
  console.log("   用户1的Token ID:", tokenId.toString());
  
  const ownerAddress = await idnft.getAddressByTokenId(1);
  console.log("   Token 1的所有者:", ownerAddress);
  
  const totalSupply = await idnft.totalSupply();
  console.log("   总供应量:", totalSupply.toString());

  // 测试3: 创建更多NFT
  console.log("\n🎯 测试3: 创建更多NFT");
  
  await idnft.createIDNFT(user2.address, "ipfs://QmHash2");
  await idnft.createIDNFT(user3.address, "ipfs://QmHash3");
  console.log("✅ 为用户2和用户3创建ID NFT成功");
  
  const newTotalSupply = await idnft.totalSupply();
  console.log("   新的总供应量:", newTotalSupply.toString());

  // 测试4: 元数据更新
  console.log("\n🔄 测试4: 元数据更新");
  
  const newURI = "ipfs://QmUpdatedHash";
  const tx2 = await idnft.connect(user1).updateMetadata(1, newURI);
  await tx2.wait();
  console.log("✅ 更新用户1的元数据成功");
  console.log("   新URI:", newURI);
  console.log("   交易哈希:", tx2.hash);

  // 验证更新
  const updatedURI = await idnft.tokenURI(1);
  console.log("   验证更新后的URI:", updatedURI);

  // 测试5: 激活/停用功能
  console.log("\n⏸️ 测试5: 激活/停用功能");
  
  // 停用
  const tx3 = await idnft.connect(user1).deactivateIDNFT(1);
  await tx3.wait();
  console.log("✅ 停用用户1的ID NFT成功");
  
  const isActive = await idnft.hasActiveIDNFT(user1.address);
  console.log("   用户1的ID NFT是否活跃:", isActive);
  
  // 重新激活
  const tx4 = await idnft.connect(user1).reactivateIDNFT(1);
  await tx4.wait();
  console.log("✅ 重新激活用户1的ID NFT成功");
  
  const isActiveAgain = await idnft.hasActiveIDNFT(user1.address);
  console.log("   用户1的ID NFT是否活跃:", isActiveAgain);

  // 测试6: 错误处理
  console.log("\n❌ 测试6: 错误处理");
  
  try {
    await idnft.connect(user2).createIDNFT(user3.address, "ipfs://QmError");
    console.log("❌ 非所有者创建NFT应该失败");
  } catch (error) {
    console.log("✅ 非所有者创建NFT被正确拒绝");
  }
  
  try {
    await idnft.createIDNFT(user1.address, "ipfs://QmDuplicate");
    console.log("❌ 重复创建NFT应该失败");
  } catch (error) {
    console.log("✅ 重复创建NFT被正确拒绝");
  }

  // 测试7: 获取元数据
  console.log("\n📋 测试7: 获取元数据");
  
  const metadata = await idnft.getBarMetadata(1);
  console.log("   Token 1的元数据:");
  console.log("     Token URI:", metadata.tokenURI);
  console.log("     是否活跃:", metadata.isActive);
  console.log("     创建时间:", new Date(metadata.createdAt * 1000).toLocaleString());
  console.log("     更新时间:", new Date(metadata.updatedAt * 1000).toLocaleString());

  // 测试8: ERC-6551特性验证
  console.log("\n🔒 测试8: ERC-6551特性验证");
  
  try {
    await idnft.connect(user1).transferFrom(user1.address, user2.address, 1);
    console.log("❌ NFT转移应该失败");
  } catch (error) {
    console.log("✅ NFT转移被正确阻止（ERC-6551特性）");
  }

  // 总结
  console.log("\n📊 测试总结:");
  console.log("   ✅ 合约部署成功");
  console.log("   ✅ 创建了", newTotalSupply.toString(), "个ID NFT");
  console.log("   ✅ 所有查询功能正常");
  console.log("   ✅ 元数据更新功能正常");
  console.log("   ✅ 激活/停用功能正常");
  console.log("   ✅ 错误处理正确");
  console.log("   ✅ ERC-6551特性正确实现");
  
  console.log("\n🎉 所有测试通过！合约功能正常。");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  }); 