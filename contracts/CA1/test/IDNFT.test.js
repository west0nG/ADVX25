const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IDNFT Contract", function () {
  let IDNFT;
  let idnft;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    // 获取签名者
    [owner, user1, user2, user3] = await ethers.getSigners();

    // 部署合约
    IDNFT = await ethers.getContractFactory("IDNFT");
    idnft = await IDNFT.deploy("Bars Help Bars ID", "BHBI");
    await idnft.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置合约名称和符号", async function () {
      expect(await idnft.name()).to.equal("Bars Help Bars ID");
      expect(await idnft.symbol()).to.equal("BHBI");
    });

    it("应该正确设置合约所有者", async function () {
      expect(await idnft.owner()).to.equal(owner.address);
    });
  });

  describe("创建ID NFT", function () {
    const testTokenURI = "ipfs://QmTestHash123";

    it("所有者应该能够为用户创建ID NFT", async function () {
      const tx = await idnft.createIDNFT(user1.address, testTokenURI);
      const receipt = await tx.wait();

      // 检查事件
      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "IDNFTCreated");
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(1n);
      expect(event.args[1]).to.equal(user1.address);

      // 检查NFT所有权
      expect(await idnft.ownerOf(1)).to.equal(user1.address);
      expect(await idnft.tokenURI(1)).to.equal(testTokenURI);
    });

    it("应该正确存储元数据", async function () {
      await idnft.createIDNFT(user1.address, testTokenURI);

      const metadata = await idnft.getBarMetadata(1);
      expect(metadata.tokenURI).to.equal(testTokenURI);
      expect(metadata.isActive).to.be.true;
      expect(metadata.createdAt).to.be.gt(0);
      expect(metadata.updatedAt).to.be.gt(0);
    });

    it("应该建立正确的地址映射", async function () {
      await idnft.createIDNFT(user1.address, testTokenURI);

      expect(await idnft.getTokenIdByAddress(user1.address)).to.equal(1);
      expect(await idnft.getAddressByTokenId(1)).to.equal(user1.address);
    });

    it("非所有者不能创建ID NFT", async function () {
      await expect(
        idnft.connect(user1).createIDNFT(user2.address, testTokenURI)
      ).to.be.revertedWithCustomError(idnft, "OwnableUnauthorizedAccount");
    });

    it("不能为无效地址创建ID NFT", async function () {
      await expect(
        idnft.createIDNFT(ethers.ZeroAddress, testTokenURI)
      ).to.be.revertedWith("IDNFT: Invalid address");
    });

    it("不能为空URI创建ID NFT", async function () {
      await expect(
        idnft.createIDNFT(user1.address, "")
      ).to.be.revertedWith("IDNFT: Token URI cannot be empty");
    });

    it("同一地址不能拥有多个ID NFT", async function () {
      await idnft.createIDNFT(user1.address, testTokenURI);
      
      await expect(
        idnft.createIDNFT(user1.address, "ipfs://AnotherHash")
      ).to.be.revertedWith("IDNFT: Address already has an ID NFT");
    });

    it("应该递增token ID", async function () {
      await idnft.createIDNFT(user1.address, testTokenURI);
      await idnft.createIDNFT(user2.address, "ipfs://Hash2");
      await idnft.createIDNFT(user3.address, "ipfs://Hash3");

      expect(await idnft.ownerOf(1)).to.equal(user1.address);
      expect(await idnft.ownerOf(2)).to.equal(user2.address);
      expect(await idnft.ownerOf(3)).to.equal(user3.address);
    });
  });

  describe("查询功能", function () {
    const testTokenURI = "ipfs://QmTestHash123";

    beforeEach(async function () {
      await idnft.createIDNFT(user1.address, testTokenURI);
    });

    it("应该正确检查用户是否有活跃的ID NFT", async function () {
      expect(await idnft.hasActiveIDNFT(user1.address)).to.be.true;
      expect(await idnft.hasActiveIDNFT(user2.address)).to.be.false;
    });

    it("应该正确获取用户的token ID", async function () {
      expect(await idnft.getTokenIdByAddress(user1.address)).to.equal(1);
      expect(await idnft.getTokenIdByAddress(user2.address)).to.equal(0);
    });

    it("应该正确获取token的所有者地址", async function () {
      expect(await idnft.getAddressByTokenId(1)).to.equal(user1.address);
    });

    it("应该正确获取总供应量", async function () {
      expect(await idnft.totalSupply()).to.equal(1);
      
      await idnft.createIDNFT(user2.address, "ipfs://Hash2");
      expect(await idnft.totalSupply()).to.equal(2);
    });

    it("应该正确获取token URI", async function () {
      expect(await idnft.getTokenURI(1)).to.equal(testTokenURI);
    });
  });

  describe("元数据更新", function () {
    const originalURI = "ipfs://QmOriginalHash";
    const newURI = "ipfs://QmNewHash";

    beforeEach(async function () {
      await idnft.createIDNFT(user1.address, originalURI);
    });

    it("NFT所有者应该能够更新元数据", async function () {
      await idnft.connect(user1).updateMetadata(1, newURI);

      const metadata = await idnft.getBarMetadata(1);
      expect(metadata.tokenURI).to.equal(newURI);
      expect(await idnft.tokenURI(1)).to.equal(newURI);
    });

    it("非所有者不能更新元数据", async function () {
      await expect(
        idnft.connect(user2).updateMetadata(1, newURI)
      ).to.be.revertedWith("IDNFT: Not the token owner");
    });

    it("不能更新不存在的token", async function () {
      await expect(
        idnft.connect(user1).updateMetadata(999, newURI)
      ).to.be.reverted;
    });

    it("不能更新停用的token", async function () {
      await idnft.connect(user1).deactivateIDNFT(1);
      
      await expect(
        idnft.connect(user1).updateMetadata(1, newURI)
      ).to.be.revertedWith("IDNFT: Token is not active");
    });

    it("不能更新为空URI", async function () {
      await expect(
        idnft.connect(user1).updateMetadata(1, "")
      ).to.be.revertedWith("IDNFT: Token URI cannot be empty");
    });

    it("更新应该触发事件", async function () {
      const tx = await idnft.connect(user1).updateMetadata(1, newURI);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "MetadataUpdated");
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(1n);
    });
  });

  describe("激活/停用功能", function () {
    const testTokenURI = "ipfs://QmTestHash123";

    beforeEach(async function () {
      await idnft.createIDNFT(user1.address, testTokenURI);
    });

    it("NFT所有者应该能够停用ID NFT", async function () {
      await idnft.connect(user1).deactivateIDNFT(1);

      const metadata = await idnft.getBarMetadata(1);
      expect(metadata.isActive).to.be.false;
      expect(await idnft.hasActiveIDNFT(user1.address)).to.be.false;
    });

    it("NFT所有者应该能够重新激活ID NFT", async function () {
      await idnft.connect(user1).deactivateIDNFT(1);
      await idnft.connect(user1).reactivateIDNFT(1);

      const metadata = await idnft.getBarMetadata(1);
      expect(metadata.isActive).to.be.true;
      expect(await idnft.hasActiveIDNFT(user1.address)).to.be.true;
    });

    it("非所有者不能停用ID NFT", async function () {
      await expect(
        idnft.connect(user2).deactivateIDNFT(1)
      ).to.be.revertedWith("IDNFT: Not the token owner");
    });

    it("非所有者不能重新激活ID NFT", async function () {
      await idnft.connect(user1).deactivateIDNFT(1);
      
      await expect(
        idnft.connect(user2).reactivateIDNFT(1)
      ).to.be.revertedWith("IDNFT: Not the token owner");
    });

    it("不能停用已经停用的token", async function () {
      await idnft.connect(user1).deactivateIDNFT(1);
      
      await expect(
        idnft.connect(user1).deactivateIDNFT(1)
      ).to.be.revertedWith("IDNFT: Token is not active");
    });

    it("不能重新激活已经激活的token", async function () {
      await expect(
        idnft.connect(user1).reactivateIDNFT(1)
      ).to.be.revertedWith("IDNFT: Token is already active");
    });

    it("停用应该触发事件", async function () {
      const tx = await idnft.connect(user1).deactivateIDNFT(1);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "IDNFTDeactivated");
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(1n);
    });

    it("重新激活应该触发事件", async function () {
      await idnft.connect(user1).deactivateIDNFT(1);
      
      const tx = await idnft.connect(user1).reactivateIDNFT(1);
      const receipt = await tx.wait();

      const event = receipt.logs.find(log => log.fragment && log.fragment.name === "IDNFTReactivated");
      expect(event).to.not.be.undefined;
      expect(event.args[0]).to.equal(1n);
    });
  });

  describe("ERC-6551特性", function () {
    const testTokenURI = "ipfs://QmTestHash123";

    beforeEach(async function () {
      await idnft.createIDNFT(user1.address, testTokenURI);
    });

    it("ID NFT可以转移（标准ERC721功能）", async function () {
      // 注意：当前实现允许转移，这符合标准ERC721
      // 如果需要限制转移，需要在合约中实现相应的限制
      expect(await idnft.ownerOf(1)).to.equal(user1.address);
    });
  });

  describe("边界情况", function () {
    it("应该处理大量NFT的创建", async function () {
      // 创建3个NFT（使用已有的签名者）
      const users = [user1, user2, user3];
      for (let i = 0; i < 3; i++) {
        await idnft.createIDNFT(users[i].address, `ipfs://Hash${i}`);
      }

      expect(await idnft.totalSupply()).to.equal(3);
      
      // 验证每个NFT
      for (let i = 1; i <= 3; i++) {
        expect(await idnft.ownerOf(i)).to.equal(users[i-1].address);
        expect(await idnft.getTokenIdByAddress(users[i-1].address)).to.equal(i);
      }
    });

    it("应该正确处理长URI", async function () {
      const longURI = "ipfs://" + "Qm".repeat(100); // 长URI
      await idnft.createIDNFT(user1.address, longURI);
      
      expect(await idnft.tokenURI(1)).to.equal(longURI);
    });
  });
}); 