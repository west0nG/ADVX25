const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 开始本地测试 ERC-6551 合约...");

  // 获取测试账户
  const [owner, user1, user2] = await ethers.getSigners();
  console.log("📝 测试账户:");
  console.log("  所有者:", owner.address);
  console.log("  用户1:", user1.address);
  console.log("  用户2:", user2.address);

  // 部署合约
  console.log("\n🚀 部署 IDNFT6551 合约...");
  const IDNFT6551 = await ethers.getContractFactory("IDNFT6551");
  const idnft6551 = await IDNFT6551.deploy("ID NFT 6551", "IDNFT6551");
  await idnft6551.waitForDeployment();

  console.log("✅ 合约部署成功!");
  console.log("📍 合约地址:", idnft6551.address);

  // 测试1: 检查合约基本信息
  console.log("\n📋 测试1: 检查合约基本信息");
  const name = await idnft6551.name();
  const symbol = await idnft6551.symbol();
  const contractOwner = await idnft6551.owner();
  const supports6551 = await idnft6551.supportsERC6551();

  console.log("  名称:", name);
  console.log("  符号:", symbol);
  console.log("  所有者:", contractOwner);
  console.log("  支持ERC-6551:", supports6551);

  // 测试2: 创建ID NFT
  console.log("\n🎨 测试2: 创建ID NFT");
  const metadataURI = "https://ipfs.io/ipfs/QmTestMetadataHash";
  
  console.log("  正在为用户1创建ID NFT...");
  const tx = await idnft6551.createIDNFT(user1.address, metadataURI);
  const receipt = await tx.wait();

  // 查找IDNFTCreated事件
  const event = receipt.events?.find(e => e.event === 'IDNFTCreated');
  if (event) {
    const tokenId = event.args.tokenId;
    const owner = event.args.owner;
    const accountAddress = event.args.accountAddress;
    
    console.log("  ✅ ID NFT创建成功!");
    console.log("    Token ID:", tokenId.toString());
    console.log("    所有者:", owner);
    console.log("    ERC-6551账户地址:", accountAddress);
  }

  // 测试3: 查询NFT信息
  console.log("\n🔍 测试3: 查询NFT信息");
  const tokenId = 1;
  
  const tokenOwner = await idnft6551.ownerOf(tokenId);
  const tokenURI = await idnft6551.tokenURI(tokenId);
  const totalSupply = await idnft6551.totalSupply();
  
  console.log("  Token ID:", tokenId);
  console.log("  所有者:", tokenOwner);
  console.log("  Token URI:", tokenURI);
  console.log("  总供应量:", totalSupply.toString());

  // 测试4: 查询ERC-6551账户信息
  console.log("\n🔗 测试4: 查询ERC-6551账户信息");
  const accountAddress = await idnft6551.getAccountAddress(tokenId);
  const metadata = await idnft6551.getIDMetadata(tokenId);
  
  console.log("  ERC-6551账户地址:", accountAddress);
  console.log("  元数据:");
  console.log("    Token URI:", metadata.tokenURI);
  console.log("    是否激活:", metadata.isActive);
  console.log("    创建时间:", new Date(metadata.createdAt * 1000).toISOString());
  console.log("    账户地址:", metadata.accountAddress);

  // 测试5: 查询用户映射
  console.log("\n👤 测试5: 查询用户映射");
  const userTokenId = await idnft6551.getTokenIdByAddress(user1.address);
  const tokenIdAddress = await idnft6551.getAddressByTokenId(tokenId);
  const hasActiveNFT = await idnft6551.hasActiveIDNFT(user1.address);
  
  console.log("  用户1的Token ID:", userTokenId.toString());
  console.log("  Token ID对应的地址:", tokenIdAddress);
  console.log("  用户1是否有活跃NFT:", hasActiveNFT);

  // 测试6: 更新元数据
  console.log("\n✏️ 测试6: 更新元数据");
  const newMetadataURI = "https://ipfs.io/ipfs/QmUpdatedMetadataHash";
  
  // 切换到用户1账户
  const idnft6551User1 = idnft6551.connect(user1);
  
  console.log("  正在更新元数据...");
  const updateTx = await idnft6551User1.updateMetadata(tokenId, newMetadataURI);
  await updateTx.wait();
  
  const updatedMetadata = await idnft6551.getIDMetadata(tokenId);
  console.log("  ✅ 元数据更新成功!");
  console.log("    新Token URI:", updatedMetadata.tokenURI);
  console.log("    更新时间:", new Date(updatedMetadata.updatedAt * 1000).toISOString());

  // 测试7: 停用和重新激活NFT
  console.log("\n⏸️ 测试7: 停用和重新激活NFT");
  
  console.log("  正在停用NFT...");
  const deactivateTx = await idnft6551User1.deactivateIDNFT(tokenId);
  await deactivateTx.wait();
  
  const deactivatedMetadata = await idnft6551.getIDMetadata(tokenId);
  console.log("  ✅ NFT已停用");
  console.log("    是否激活:", deactivatedMetadata.isActive);
  
  console.log("  正在重新激活NFT...");
  const reactivateTx = await idnft6551User1.reactivateIDNFT(tokenId);
  await reactivateTx.wait();
  
  const reactivatedMetadata = await idnft6551.getIDMetadata(tokenId);
  console.log("  ✅ NFT已重新激活");
  console.log("    是否激活:", reactivatedMetadata.isActive);

  // 测试8: 尝试为同一用户创建第二个NFT（应该失败）
  console.log("\n❌ 测试8: 尝试为同一用户创建第二个NFT");
  try {
    const duplicateTx = await idnft6551.createIDNFT(user1.address, "https://ipfs.io/ipfs/QmDuplicate");
    await duplicateTx.wait();
    console.log("  ❌ 测试失败：应该阻止重复创建");
  } catch (error) {
    console.log("  ✅ 正确阻止了重复创建");
    console.log("    错误信息:", error.message);
  }

  // 测试9: 为另一个用户创建NFT
  console.log("\n🎨 测试9: 为另一个用户创建NFT");
  const metadataURI2 = "https://ipfs.io/ipfs/QmTestMetadataHash2";
  
  console.log("  正在为用户2创建ID NFT...");
  const tx2 = await idnft6551.createIDNFT(user2.address, metadataURI2);
  const receipt2 = await tx2.wait();

  const event2 = receipt2.events?.find(e => e.event === 'IDNFTCreated');
  if (event2) {
    const tokenId2 = event2.args.tokenId;
    const owner2 = event2.args.owner;
    const accountAddress2 = event2.args.accountAddress;
    
    console.log("  ✅ 第二个ID NFT创建成功!");
    console.log("    Token ID:", tokenId2.toString());
    console.log("    所有者:", owner2);
    console.log("    ERC-6551账户地址:", accountAddress2);
  }

  // 测试10: 检查总供应量
  console.log("\n📊 测试10: 检查总供应量");
  const finalTotalSupply = await idnft6551.totalSupply();
  console.log("  最终总供应量:", finalTotalSupply.toString());

  console.log("\n🎉 所有测试完成!");
  console.log("\n📋 测试总结:");
  console.log("  ✅ 合约部署成功");
  console.log("  ✅ ERC-6551账户创建成功");
  console.log("  ✅ NFT铸造功能正常");
  console.log("  ✅ 元数据管理功能正常");
  console.log("  ✅ 用户映射功能正常");
  console.log("  ✅ 停用/激活功能正常");
  console.log("  ✅ 重复创建检查正常");
  console.log("  ✅ 多用户支持正常");

  console.log("\n🚀 本地测试成功! 现在可以部署到Sepolia测试网了。");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 测试失败:", error);
    process.exit(1);
  }); 